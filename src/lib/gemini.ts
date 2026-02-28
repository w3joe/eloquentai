import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserProfile, Scenario, FeedbackData, TranscriptEntry, CorrectionItem, VocabularyItem } from './types';
import { LANGUAGES } from './types';
import { formatThreadsForLLM } from './whatsapp-messages';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

function langName(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.name ?? code;
}

/**
 * Extract a structured user profile from their free-text bio and context tags.
 */
export async function extractProfile(bio: string, contextTags: string[], targetLanguage: string): Promise<{
  profession: string;
  interests: string[];
  conversationTopics: string[];
  displayName: string;
  level: string;
}> {
  const prompt = `You are a language learning app assistant. Analyze the following user bio and context tags, then extract a structured profile.

Bio: "${bio}"
Context tags: ${JSON.stringify(contextTags)}
Target language: ${langName(targetLanguage)}

Return a JSON object with exactly these fields:
- "profession": a short profession title (e.g. "Software Engineer", "Marketing Manager")
- "interests": array of 3-5 key interests relevant to language practice
- "conversationTopics": array of 3-4 conversation topics they'd likely encounter in their target language
- "displayName": extract or infer a short display name (first name or first two words)
- "level": infer their likely language level from context ("Beginner", "Intermediate", or "Advanced")

Return ONLY valid JSON, no markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

/**
 * Generate personalized conversation scenarios based on user profile.
 */
export async function generateScenarios(profile: UserProfile): Promise<Scenario[]> {
  const targetLang = langName(profile.target_language);
  const prompt = `You are a language learning app. Generate 3 conversation practice scenarios for a user learning ${targetLang}.

User profile:
- Profession: ${profile.profession || 'Not specified'}
- Interests: ${profile.interests.join(', ') || 'General'}
- Level: ${profile.level}
- Bio: "${profile.bio}"
- Context tags: ${JSON.stringify(profile.context_tags)}

Create 3 diverse scenarios at different difficulty levels (one Beginner, one Intermediate, one Advanced) that are personalized to this user's profession and interests.

Return a JSON array where each scenario has:
- "id": string (1, 2, 3)
- "title": short engaging title (under 60 chars)
- "description": one-sentence description
- "difficulty": "Beginner" | "Intermediate" | "Advanced"
- "duration": estimated minutes (3-10)
- "icon": a single relevant emoji
- "scene": 1-2 sentence scene-setting description in second person
- "character": { "name": a ${targetLang}-appropriate name, "role": their role, "personality": 2-3 personality traits, "voiceLabel": "${targetLang} Male/Female · Style" }
- "tips": array of 2 specific language tips for this scenario

Return ONLY valid JSON array, no markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

/**
 * Generate a custom scenario from a user-provided description.
 */
export async function generateCustomScenario(description: string, profile: UserProfile): Promise<Scenario> {
  const targetLang = langName(profile.target_language);
  const prompt = `You are a language learning app. Create a conversation practice scenario based on this user request:
"${description}"

User is learning ${targetLang} at ${profile.level} level.
Profession: ${profile.profession || 'Not specified'}

Return a JSON object with:
- "id": "custom"
- "title": short engaging title (under 60 chars)
- "description": one-sentence description
- "difficulty": "${profile.level}"
- "duration": estimated minutes (3-10)
- "icon": a single relevant emoji
- "scene": 1-2 sentence scene-setting description in second person
- "character": { "name": a ${targetLang}-appropriate name, "role": their role, "personality": 2-3 personality traits, "voiceLabel": "${targetLang} Male/Female · Style" }
- "tips": array of 2 specific language tips for this scenario

Return ONLY valid JSON, no markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

/**
 * Generate conversation scenarios based on WhatsApp message history.
 * Uses real messaging patterns as context for the LLM to create
 * realistic language practice scenarios.
 */
export async function generateScenariosFromMessages(profile: UserProfile): Promise<Scenario[]> {
  const targetLang = langName(profile.target_language);
  const messageContext = formatThreadsForLLM();

  const prompt = `You are a language learning app. A student who works as a food delivery rider wants to practice ${targetLang} for their job.

Below are their real WhatsApp message threads from work. Analyze these messages to understand the situations they encounter daily:

${messageContext}

User profile:
- Profession: ${profile.profession || 'Food delivery rider'}
- Level: ${profile.level}
- Native language: ${langName(profile.native_language)}
- Target language: ${targetLang}

Based on these REAL conversations, generate 3 conversation practice scenarios that reflect situations this rider actually faces. The scenarios should help them practice ${targetLang} in contexts they deal with every day.

Create scenarios at different difficulty levels (one Beginner, one Intermediate, one Advanced).

Return a JSON array where each scenario has:
- "id": string (1, 2, 3)
- "title": short engaging title (under 60 chars)
- "description": one-sentence description referencing the real situation
- "difficulty": "Beginner" | "Intermediate" | "Advanced"
- "duration": estimated minutes (3-10)
- "icon": a single relevant emoji
- "scene": 1-2 sentence scene-setting description in second person, inspired by the real messages
- "character": { "name": a ${targetLang}-appropriate name, "role": their role (customer/restaurant staff/support agent/fellow rider), "personality": 2-3 personality traits, "voiceLabel": "${targetLang} Male/Female · Style" }
- "tips": array of 2 specific language tips for handling this real-world situation in ${targetLang}

Return ONLY valid JSON array, no markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

/**
 * Generate feedback analysis from a conversation transcript.
 */
export async function generateFeedback(
  transcript: TranscriptEntry[],
  scenario: Scenario,
  targetLanguage: string,
  duration: number,
): Promise<FeedbackData> {
  const targetLang = langName(targetLanguage);
  const userMessages = transcript.filter(t => t.role === 'user').map(t => t.text);
  const formattedTranscript = transcript.map(t => `${t.role === 'user' ? 'User' : 'AI'}: ${t.text}`).join('\n');

  const prompt = `You are a language tutor analyzing a ${targetLang} conversation practice session.

Scenario: "${scenario.title}"
Character: ${scenario.character.name} (${scenario.character.role})

Full transcript:
${formattedTranscript}

User's messages in ${targetLang}:
${userMessages.join('\n')}

Analyze the user's ${targetLang} usage and return a JSON object with:
- "fluencyScore": number 0-100 rating their overall fluency
- "corrections": array of objects with { "original": exact text the user said wrong, "correction": corrected version, "explanation": brief grammar/usage explanation }. Include 2-5 corrections. If the user made no mistakes, include 1-2 suggestions for more natural phrasing.
- "vocabulary": array of 3-5 objects with { "word": a ${targetLang} word from the conversation or related to the topic, "translation": English translation, "example": example sentence using the word }
- "summary": 2-3 sentence summary of how they did, what was good, what to improve
- "focusTip": one specific actionable tip for their next practice session

Return ONLY valid JSON, no markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    fluencyScore: parsed.fluencyScore,
    corrections: parsed.corrections as CorrectionItem[],
    vocabulary: parsed.vocabulary as VocabularyItem[],
    summary: parsed.summary,
    focusTip: parsed.focusTip,
    duration,
    scenarioName: scenario.title,
    language: targetLang,
    date: new Date().toISOString(),
  };
}
