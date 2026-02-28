export interface UserProfile {
  id?: string;
  user_id?: string;
  native_language: string;
  target_language: string;
  bio: string;
  context_tags: string[];
  profession: string;
  interests: string[];
  conversation_topics: string[];
  level: string;
  display_name: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  icon: string;
  scene: string;
  character: {
    name: string;
    role: string;
    personality: string;
    voiceLabel: string;
  };
  tips: string[];
}

export interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

export interface CorrectionItem {
  original: string;
  correction: string;
  explanation: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  example: string;
  saved?: boolean;
}

export interface FeedbackData {
  fluencyScore: number;
  corrections: CorrectionItem[];
  vocabulary: VocabularyItem[];
  summary: string;
  focusTip: string;
  duration: number;
  scenarioName: string;
  language: string;
  date: string;
  pronunciation?: PronunciationAssessment[];
  pronunciationScore?: number;
}

export type ConversationStatus = 'idle' | 'connecting' | 'listening' | 'agent_speaking' | 'processing' | 'ended' | 'error';

export type PronunciationTier = 'high' | 'medium' | 'low';

export interface PronunciationPhoneme {
  phoneme: string;
  accuracyScore: number;
}

export interface PronunciationWord {
  word: string;
  accuracyScore: number;
  errorType: string;
  tier: PronunciationTier;
  phonemes?: PronunciationPhoneme[];
}

export interface PronunciationAssessment {
  transcript: string;
  overall_score: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: PronunciationWord[];
}

export const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const;
