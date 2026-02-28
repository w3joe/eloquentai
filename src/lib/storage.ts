import type { UserProfile, FeedbackData, Scenario } from './types';

const PROFILE_KEY = 'eloquent_profile';
const SESSIONS_KEY = 'eloquent_sessions';
const SCENARIOS_KEY = 'eloquent_scenarios';

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveSession(feedback: FeedbackData): void {
  const sessions = getSessions();
  sessions.unshift(feedback);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessions(): FeedbackData[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FeedbackData[];
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: Scenario[]): void {
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
}

export function getSavedScenarios(): Scenario[] | null {
  const raw = localStorage.getItem(SCENARIOS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Scenario[];
  } catch {
    return null;
  }
}

export function clearAll(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(SCENARIOS_KEY);
}
