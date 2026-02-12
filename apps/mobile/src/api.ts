export type TonePreference = "direct" | "really_blunt" | "gentle_but_firm";

export interface EntryResponse {
  id: string;
  text: string;
  starterPrompt?: string;
  createdAt: string;
  guidance?: {
    id: string;
    text: string;
    tone: TonePreference;
    createdAt: string;
  };
}

const baseUrl = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text || response.statusText}`);
  }
  return (await response.json()) as T;
}

export async function saveOnboarding(input: {
  userId: string;
  tone: TonePreference;
  mbti?: string;
  enneagram?: string;
  bigFive?: string;
  skippedOnboarding?: boolean;
}): Promise<void> {
  await request("/v1/onboarding/profile", {
    method: "POST",
    body: JSON.stringify({
      userId: input.userId,
      mbti: input.mbti,
      enneagram: input.enneagram,
      bigFive: input.bigFive,
      skippedOnboarding: input.skippedOnboarding ?? false,
    }),
  });

  await request("/v1/settings/tone", {
    method: "PATCH",
    body: JSON.stringify({
      userId: input.userId,
      tone: input.tone,
      dynamicToneAdaptation: false,
    }),
  });
}

export function getStarterPrompts(): Promise<{ prompts: string[] }> {
  return request("/v1/journal/prompts");
}

export function submitEntry(input: {
  userId: string;
  text: string;
  starterPrompt?: string;
}): Promise<EntryResponse> {
  return request("/v1/journal/entries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
