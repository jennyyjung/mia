import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import type {
  GuidanceMessage,
  JournalEntry,
  WisdomNugget,
} from "@mia/domain/src/index.js";
import { getOrCreateUserState } from "./data/store.js";
import { generateText } from "./infra/llmClient.js";
import { buildSystemPrompt } from "./personality/promptBuilder.js";
import { id } from "./utils/id.js";

const onboardingSchema = z.object({
  userId: z.string().min(1),
  mbti: z.string().optional(),
  enneagram: z.string().optional(),
  bigFive: z.string().optional(),
  skippedOnboarding: z.boolean().optional(),
});

const toneSchema = z.object({
  userId: z.string().min(1),
  tone: z.enum(["direct", "really_blunt", "gentle_but_firm"]),
  dynamicToneAdaptation: z.boolean().optional(),
});

const entrySchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1),
  starterPrompt: z.string().optional(),
});

const inferSchema = z.object({
  userId: z.string().min(1),
});

const wisdomSchema = z.object({
  userId: z.string().min(1),
});

function parseOr400<T>(
  schema: z.ZodType<T>,
  req: Request,
  res: Response,
): T | null {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return null;
  }
  return parsed.data;
}

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.post("/v1/onboarding/profile", (req, res) => {
  const body = parseOr400(onboardingSchema, req, res);
  if (!body) {
    return;
  }
  const user = getOrCreateUserState(body.userId);
  user.profile = {
    mbti: body.mbti,
    enneagram: body.enneagram,
    bigFive: body.bigFive,
    skippedOnboarding: body.skippedOnboarding ?? false,
  };
  res.json(user.profile);
});

router.patch("/v1/settings/tone", (req, res) => {
  const body = parseOr400(toneSchema, req, res);
  if (!body) {
    return;
  }
  const user = getOrCreateUserState(body.userId);
  user.settings = {
    tone: body.tone,
    dynamicToneAdaptation: body.dynamicToneAdaptation ?? false,
  };
  res.json(user.settings);
});

router.get("/v1/journal/prompts", (_req, res) => {
  res.json({
    prompts: [
      "What are you avoiding today?",
      "What decision are you delaying and why?",
      "Where are you choosing comfort over growth right now?",
    ],
  });
});

router.post("/v1/journal/entries", async (req, res) => {
  const body = parseOr400(entrySchema, req, res);
  if (!body) {
    return;
  }
  const user = getOrCreateUserState(body.userId);
  const systemPrompt = buildSystemPrompt({
    tone: user.settings.tone,
    mbti: user.profile.mbti,
    enneagram: user.profile.enneagram,
    bigFive: user.profile.bigFive,
  });

  const guidanceText = await generateText({
    systemPrompt,
    userPrompt: body.text,
  });

  const entryId = id("entry");
  const guidance: GuidanceMessage = {
    id: id("guide"),
    entryId,
    text: guidanceText,
    tone: user.settings.tone,
    createdAt: new Date().toISOString(),
  };

  const entry: JournalEntry = {
    id: entryId,
    userId: body.userId,
    text: body.text,
    starterPrompt: body.starterPrompt,
    createdAt: new Date().toISOString(),
    guidance,
  };
  user.entries.unshift(entry);

  res.status(201).json(entry);
});

router.get("/v1/journal/entries", (req, res) => {
  const userId = String(req.query.userId ?? "");
  const query = String(req.query.query ?? "").toLowerCase();
  if (!userId) {
    res.status(400).json({ error: "userId query param is required" });
    return;
  }
  const user = getOrCreateUserState(userId);
  const filtered = user.entries.filter((entry) => {
    if (!query) {
      return true;
    }
    const haystack = `${entry.text} ${entry.guidance?.text ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });
  res.json({ entries: filtered });
});

router.post("/v1/personality/infer", (req, res) => {
  const body = parseOr400(inferSchema, req, res);
  if (!body) {
    return;
  }
  const user = getOrCreateUserState(body.userId);
  const joined = user.entries.map((e) => e.text).join(" ").toLowerCase();
  let suggestion = "INFP";
  if (joined.includes("plan") || joined.includes("strategy")) {
    suggestion = "INTJ";
  }
  user.profile.inferredSuggestion = suggestion;
  res.json({
    suggestion,
    message: `Based on your entries, you might be ${suggestion}.`,
  });
});

router.post("/v1/wisdom/generate", async (req, res) => {
  const body = parseOr400(wisdomSchema, req, res);
  if (!body) {
    return;
  }
  const user = getOrCreateUserState(body.userId);
  const latestEntry = user.entries[0];
  const userPrompt = latestEntry
    ? `Generate a short wisdom nugget based on this latest entry:\n${latestEntry.text}`
    : "Generate a short wisdom nugget encouraging reflective journaling.";

  const nuggetText = await generateText({
    systemPrompt: buildSystemPrompt({
      tone: user.settings.tone,
      mbti: user.profile.mbti,
      enneagram: user.profile.enneagram,
      bigFive: user.profile.bigFive,
    }),
    userPrompt,
  });

  const nugget: WisdomNugget = {
    id: id("nugget"),
    userId: body.userId,
    text: nuggetText,
    createdAt: new Date().toISOString(),
  };
  user.wisdomNuggets.unshift(nugget);
  res.status(201).json(nugget);
});

router.get("/v1/wisdom/latest", (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    res.status(400).json({ error: "userId query param is required" });
    return;
  }
  const user = getOrCreateUserState(userId);
  res.json({ nugget: user.wisdomNuggets[0] ?? null });
});
