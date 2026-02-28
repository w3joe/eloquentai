import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import type { PronunciationAssessment, PronunciationWord, PronunciationPhoneme, PronunciationTier } from './types';

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY as string;
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION as string;

// Map short language codes to Azure Speech locale codes
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
};

function toLocale(code: string): string {
  return LOCALE_MAP[code] ?? code;
}

function toTier(score: number): PronunciationTier {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/**
 * Run a pronunciation assessment on a pre-recorded PCM audio buffer.
 * Expects 16kHz, 16-bit, mono PCM (the Azure Speech SDK default input format).
 */
export function assessPronunciation(language: string, pcmAudio: ArrayBuffer): Promise<PronunciationAssessment> {
  return new Promise((resolve, reject) => {
    if (!SPEECH_KEY || !SPEECH_REGION) {
      reject(new Error('Azure Speech credentials not configured. Set VITE_AZURE_SPEECH_KEY and VITE_AZURE_SPEECH_REGION.'));
      return;
    }

    if (pcmAudio.byteLength === 0) {
      reject(new Error('No audio data recorded.'));
      return;
    }

    const locale = toLocale(language);

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = locale;

    // Feed the recorded PCM buffer via a PushAudioInputStream
    const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(format);
    pushStream.write(pcmAudio);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      '',  // empty = unscripted / free speech mode
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      false, // enableMiscue
    );
    pronunciationConfig.phonemeAlphabet = 'IPA';

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close();

        if (result.reason === sdk.ResultReason.NoMatch) {
          reject(new Error('No speech detected. Please try again.'));
          return;
        }

        if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
          reject(new Error(`Recognition failed: ${sdk.ResultReason[result.reason]}`));
          return;
        }

        const assessmentResult = sdk.PronunciationAssessmentResult.fromResult(result);

        // Parse detailed word/phoneme data from the raw JSON response
        const jsonStr = result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
        const json = JSON.parse(jsonStr);

        const nBest = json?.NBest?.[0];
        const rawWords: any[] = nBest?.Words ?? [];

        const words: PronunciationWord[] = rawWords.map((w: any) => {
          const acc = w.PronunciationAssessment?.AccuracyScore ?? 0;
          const phonemes: PronunciationPhoneme[] = (w.Phonemes ?? []).map((p: any) => ({
            phoneme: p.Phoneme,
            accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
          }));

          return {
            word: w.Word,
            accuracyScore: Math.round(acc),
            errorType: w.PronunciationAssessment?.ErrorType ?? 'None',
            tier: toTier(acc),
            phonemes,
          };
        });

        resolve({
          transcript: result.text,
          overall_score: Math.round(assessmentResult.pronunciationScore),
          accuracyScore: Math.round(assessmentResult.accuracyScore),
          fluencyScore: Math.round(assessmentResult.fluencyScore),
          completenessScore: Math.round(assessmentResult.completenessScore),
          words,
        });
      },
      (err) => {
        recognizer.close();
        reject(new Error(err));
      },
    );
  });
}
