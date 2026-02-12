export async function generateText(input: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  void input.systemPrompt;
  const trimmed = input.userPrompt.slice(0, 180);
  return `Hard truth: you may be avoiding the highest-leverage action. Name one uncomfortable step and do it today. Context noted: "${trimmed}"`;
}
