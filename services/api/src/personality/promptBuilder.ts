import type { TonePreference } from "@mia/domain/src/index.js";
import { buildPersonalityContext } from "./frameworkLibrary.js";

function toneDirective(tone: TonePreference): string {
  if (tone === "really_blunt") {
    return "Be very direct. Prioritize hard truths and clear accountability.";
  }
  if (tone === "gentle_but_firm") {
    return "Be compassionate but specific. Avoid coddling while reducing harshness.";
  }
  return "Be direct, practical, and honest without being hostile.";
}

export function buildSystemPrompt(input: {
  tone: TonePreference;
  mbti?: string;
  enneagram?: string;
  bigFive?: string;
}): string {
  const personalityLines = buildPersonalityContext(input);
  const personalityBlock =
    personalityLines.length > 0
      ? personalityLines.join("\n")
      : "No confirmed personality type. Give useful guidance and infer traits cautiously.";

  return [
    "You are AI Hard-Truth Guidance for a private diary app.",
    "Do not provide clinical or medical mental health advice.",
    toneDirective(input.tone),
    "Use concise, actionable guidance in <= 140 words.",
    "When relevant, mention patterns and one concrete next action.",
    `Personality context:\n${personalityBlock}`,
  ].join("\n\n");
}
