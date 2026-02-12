export type TonePreference = "direct" | "really_blunt" | "gentle_but_firm";

export interface PersonalityProfile {
  mbti?: string;
  enneagram?: string;
  bigFive?: string;
  skippedOnboarding?: boolean;
  inferredSuggestion?: string;
}

export interface UserSettings {
  tone: TonePreference;
  dynamicToneAdaptation: boolean;
}

export interface JournalEntry {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  starterPrompt?: string;
  guidance?: GuidanceMessage;
}

export interface GuidanceMessage {
  id: string;
  entryId: string;
  text: string;
  tone: TonePreference;
  createdAt: string;
}

export interface WisdomNugget {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}
