const MBTI: Record<string, string> = {
  INTJ: "Strategic, independent, and systems-oriented. Growth edge: empathy in communication and practical diplomacy.",
  INFP: "Values-driven and reflective. Growth edge: translating ideals into consistent action under pressure.",
  ENTP: "Idea-generative and challenge-seeking. Growth edge: follow-through and avoiding novelty-driven drift.",
};

const ENNEAGRAM: Record<string, string> = {
  "1": "Principled and improvement-oriented. Growth edge: easing self-criticism and rigidity.",
  "5": "Analytical and private. Growth edge: emotional expression and acting before certainty is complete.",
  "8": "Assertive and protective. Growth edge: vulnerability and listening before control.",
};

const BIG_FIVE: Record<string, string> = {
  OCEAN_HIGH_OPENNESS:
    "High openness indicates curiosity and abstract thinking. Growth edge: grounding ideas into execution.",
};

export function buildPersonalityContext(input: {
  mbti?: string;
  enneagram?: string;
  bigFive?: string;
}): string[] {
  const lines: string[] = [];

  if (input.mbti && MBTI[input.mbti]) {
    lines.push(`MBTI ${input.mbti}: ${MBTI[input.mbti]}`);
  }
  if (input.enneagram && ENNEAGRAM[input.enneagram]) {
    lines.push(`Enneagram ${input.enneagram}: ${ENNEAGRAM[input.enneagram]}`);
  }
  if (input.bigFive && BIG_FIVE[input.bigFive]) {
    lines.push(`Big Five ${input.bigFive}: ${BIG_FIVE[input.bigFive]}`);
  }

  return lines;
}
