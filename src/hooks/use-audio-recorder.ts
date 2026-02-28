import { useCallback, useRef, useState } from 'react';
import { PronunciationAssessment } from '@/lib/types';
import { assessPronunciation } from '@/lib/azure-speech';

const TARGET_SAMPLE_RATE = 16000;

/**
 * Hook that records audio from the shared MediaStream during each user
 * utterance, then sends the captured PCM buffer to Azure Speech SDK for
 * pronunciation assessment. This avoids opening a second mic stream that
 * would conflict with ElevenLabs.
 */
export function useAudioRecorder(language: string = 'en') {
  const [assessments, setAssessments] = useState<PronunciationAssessment[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const recordingRef = useRef(false);

  /** Store the shared MediaStream so we can tap into it later. */
  const attachStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream;
  }, []);

  /** Start capturing PCM samples from the shared stream. */
  const startUtterance = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    recordingRef.current = true;

    // Reuse or create an AudioContext
    if (!contextRef.current || contextRef.current.state === 'closed') {
      contextRef.current = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
    }
    const ctx = contextRef.current;

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Connect the mic stream to a ScriptProcessor so we can grab raw PCM
    const source = ctx.createMediaStreamSource(stream);
    sourceRef.current = source;

    // 4096-sample buffer, mono input, mono output
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      if (!recordingRef.current) return;
      // Copy the channel data (it gets reused by the browser)
      const input = e.inputBuffer.getChannelData(0);
      chunksRef.current.push(new Float32Array(input));
    };
    workletRef.current = processor;

    source.connect(processor);
    // Connect to destination to keep the pipeline alive (output is silent)
    processor.connect(ctx.destination);
  }, []);

  /** Stop recording and send the buffered audio to Azure for assessment. */
  const finishUtterance = useCallback(async (): Promise<PronunciationAssessment | null> => {
    recordingRef.current = false;

    // Disconnect the processor to stop capturing
    if (workletRef.current) {
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    const chunks = chunksRef.current;
    chunksRef.current = [];

    if (chunks.length === 0) return null;

    // Merge Float32 chunks into one buffer
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert Float32 [-1,1] to Int16 PCM for Azure
    const pcm = new Int16Array(merged.length);
    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    setIsAssessing(true);
    try {
      const result = await assessPronunciation(language, pcm.buffer);

      // Skip results with too few words (unreliable)
      if (result.words.length < 2) return null;

      setAssessments((prev) => [...prev, result]);
      return result;
    } catch (err) {
      console.error('Assessment failed:', err);
      return null;
    } finally {
      setIsAssessing(false);
    }
  }, [language]);

  return {
    attachStream,
    startUtterance,
    finishUtterance,
    assessments,
    isAssessing,
  };
}
