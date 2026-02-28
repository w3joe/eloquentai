import { Scenario, FeedbackData } from './types';

export const mockScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Job interview at a tech company',
    description: 'Practice answering common interview questions in English',
    difficulty: 'Intermediate',
    duration: 5,
    icon: '💼',
    scene: "You're interviewing for a software engineer role at a US tech company. Sarah, the hiring manager, starts with some background questions.",
    character: {
      name: 'Sarah',
      role: 'Hiring Manager',
      personality: 'Professional, encouraging, detail-oriented',
      voiceLabel: 'English Female · Professional',
    },
    tips: ['Use "I have experience with..." to describe your skills', 'Speak in complete sentences, not just keywords'],
  },
  {
    id: '2',
    title: 'Discuss your project with a colleague',
    description: 'Talk through technical decisions with an English-speaking coworker',
    difficulty: 'Advanced',
    duration: 8,
    icon: '💻',
    scene: "You're in a meeting with your colleague James to review the design of your new feature. He wants to understand your technical approach.",
    character: {
      name: 'James',
      role: 'Senior Engineer',
      personality: 'Analytical, curious, collaborative',
      voiceLabel: 'English Male · Technical',
    },
    tips: ['Use phrases like "The reason I chose..." to explain decisions', 'Ask "Does that make sense?" to check understanding'],
  },
  {
    id: '3',
    title: 'Order coffee and chat with a barista',
    description: 'Casual small talk at a coffee shop',
    difficulty: 'Beginner',
    duration: 4,
    icon: '☕',
    scene: "You walk into a neighbourhood coffee shop. Emma, the friendly barista, greets you and asks what you'd like.",
    character: {
      name: 'Emma',
      role: 'Barista',
      personality: 'Friendly, chatty, welcoming',
      voiceLabel: 'English Female · Casual',
    },
    tips: ['Use "Could I have..." to order politely', 'Small talk phrases: "How\'s your day going?"'],
  },
];

export const mockFeedback: FeedbackData = {
  fluencyScore: 72,
  corrections: [
    {
      original: 'I am very interest in this position',
      correction: 'I am very interested in this position',
      explanation: '"Interested" is an adjective here — use the past participle form, not the base verb.',
    },
    {
      original: 'I have work there since 3 years',
      correction: 'I have worked there for 3 years',
      explanation: 'Use "worked" (past participle) with present perfect, and "for" with a duration of time.',
    },
    {
      original: 'My team is make a new feature',
      correction: 'My team is making a new feature',
      explanation: 'Present continuous requires the -ing form: "is making", not "is make".',
    },
  ],
  vocabulary: [
    { word: 'collaborate', translation: '协作', example: 'I collaborate closely with the design team.' },
    { word: 'proficient', translation: '熟练的', example: 'I am proficient in Python and TypeScript.' },
    { word: 'initiative', translation: '主动性', example: 'I took the initiative to refactor the codebase.' },
  ],
  summary: 'You communicated your experience clearly and showed good confidence. Your vocabulary is solid for technical topics, but watch out for verb tense errors — especially present perfect and continuous forms.',
  focusTip: 'Practice present perfect: "I have done X" vs simple past "I did X". These are very common in interviews.',
  duration: 312,
  scenarioName: 'Job interview at a tech company',
  language: 'English',
  date: new Date().toISOString(),
};

export const mockProfile = {
  native_language: 'zh',
  target_language: 'en',
  bio: '',
  context_tags: [],
  profession: '',
  interests: [],
  conversation_topics: [],
  level: 'Intermediate',
  display_name: '',
};
