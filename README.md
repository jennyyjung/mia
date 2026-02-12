# MIA App (MVP Framework)

MVP scaffolding for a mobile-first diary app that gives personality-aware, direct guidance.

## MVP Scope Implemented

- Personality onboarding:
  - Known type input (MBTI, Enneagram, Big Five)
  - Skip onboarding if unknown
  - Personality inference endpoint scaffold from journal entries
- Diary:
  - Freeform journal submission
  - Starter prompts endpoint
  - Entry history list + basic search support
- AI guidance:
  - Reactive guidance on each entry
  - Tone calibration (`direct`, `really_blunt`, `gentle_but_firm`)
  - System-prompt personality injection architecture (MVP path)
- Proactive guidance:
  - Wisdom nugget generation endpoint
  - Scheduler hook for daily nuggets (framework-level)
- Mobile-first:
  - React Native/Expo shell with onboarding, journaling, and history flows
  - Push notification service adapter scaffold

## Explicitly Out of Scope (Non-MVP)

- Payments/subscriptions
- Team or enterprise features
- Wellness tracking (fitness, nutrition, meditation)
- Full production auth and database
- Full RAG personality retrieval (future phase)

## Monorepo Layout

```text
apps/mobile          # Expo app shell for MVP UX
services/api         # Node/Express MVP API
packages/domain      # Shared types/enums/contracts
```

## Quick Start

1. Install dependencies:
   - `npm install`
2. Run API:
   - `npm run dev -w @mia/api`
3. Run mobile app:
   - `npm run dev -w @mia/mobile`

### Mobile API Base URL

- The mobile app uses `EXPO_PUBLIC_API_BASE_URL` and defaults to `http://localhost:4000`.
- For device testing, set it to your machine LAN IP, for example:
  - `set EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000`

## Notes

- Data storage is in-memory in this scaffold for speed of iteration.
- Replace `services/api/src/infra/llmClient.ts` with your LLM provider.
- Replace scheduler + notifications adapters with production integrations.
