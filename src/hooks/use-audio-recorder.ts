import { useCallback, useState } from 'react';
import { PronunciationAssessment } from '@/lib/types';
import { assessPronunciation } from '@/lib/azure-speech';

/**
 * Hook for pronunciation assessment during conversations.
 * Uses Azure Speech SDK directly — no backend needed.
 * The SDK manages its own mic access alongside ElevenLabs.
 */
export function useAudioRecorder(language: string = 'en') {
  const [assessments, setAssessments] = useState<PronunciationAssessment[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);

  // No-op: Azure SDK manages its own audio input
  const attachStream = useCallback((_stream: MediaStream) => {}, []);

  // No-op: Azure's recognizeOnceAsync handles start/stop internally
  const startUtterance = useCallback(() => {}, []);

  const finishUtterance = useCallback(async (): Promise<PronunciationAssessment | null> => {
    setIsAssessing(true);
    try {
      const result = await assessPronunciation(language);

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
