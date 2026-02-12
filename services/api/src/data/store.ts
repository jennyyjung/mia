import type {
  JournalEntry,
  PersonalityProfile,
  UserSettings,
  WisdomNugget,
} from "@mia/domain/src/index.js";

const defaultSettings: UserSettings = {
  tone: "direct",
  dynamicToneAdaptation: false,
};

export interface UserState {
  profile: PersonalityProfile;
  settings: UserSettings;
  entries: JournalEntry[];
  wisdomNuggets: WisdomNugget[];
}

const state = new Map<string, UserState>();

export function getOrCreateUserState(userId: string): UserState {
  const existing = state.get(userId);
  if (existing) {
    return existing;
  }

  const created: UserState = {
    profile: {},
    settings: defaultSettings,
    entries: [],
    wisdomNuggets: [],
  };
  state.set(userId, created);
  return created;
}
