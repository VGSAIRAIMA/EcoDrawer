# AGENT.md: Rules for the AI coding agent working on EcoDrawer

Read this file first in every session. Then read `PRD.md` (what to build), `DESIGN.md` (how it looks) and `AGENT_PROMPT.md` (the full build brief). The single-file prototype `index.html` is the behavioural reference.

## Project in one line
EcoDrawer is a bilingual (English + Tamil), age-adaptive e-waste awareness web app: video lessons with pass-mark quizzes, six levelled games, a photo classifier, recycler booking, a bot, and a rewards system. It answers hackathon problem P15 (E-Waste Awareness).

## Stack
React + Vite + TypeScript, Tailwind, Zustand, i18next, Firebase (Auth, Firestore, Hosting, Functions), Claude API (server side only), Teachable Machine + TensorFlow.js, Leaflet/OpenStreetMap, Vitest, Playwright.

## Commands (create these scripts in `package.json`)
```
npm run dev        # local dev server
npm run build      # production build
npm run test       # unit tests (Vitest)
npm run e2e        # Playwright smoke test
npm run lint       # ESLint + tsc --noEmit
npm run emulators  # Firebase emulators (auth, firestore, functions)
```
Run `npm run lint && npm run test` before saying a task is done.

## Folder layout
```
src/
  app/            routes, providers, theme (age-based)
  screens/        Auth, Onboarding, Home, Learn, Module, Play, Game, Scan, Schedule, Profile, Rewards, Settings
  components/     Carousel, BottomNav, TopBar, StreakChip, BotPanel, VideoPlayer, QuizRunner, Calendar, ...
  games/          swipe, myth, bin, toxic, dash, memory  (one folder each, shared engine in games/engine.ts)
  data/           modules.json, items.json, myths.json, bins.json, toxic.json, memory.json, categories.json, recyclers.json, videos.json
  locales/        en.json, ta.json
  lib/            firebase.ts, points.ts, streak.ts, classifier.ts, ics.ts, seed.ts
functions/        bot (Claude proxy), whatsapp webhook, scheduled reminders
tests/            unit + e2e
```

## Code conventions
- TypeScript strict mode. No `any` unless commented why.
- No hard-coded user-facing strings. Every string goes through i18next (`t('key')`) with entries in both `en.json` and `ta.json`.
- Content (questions, notes, items) lives in `src/data/*.json`, never inside components.
- One component per file. Small pure functions for game logic, so they are unit testable.
- Game levels use a seeded RNG so level N is reproducible.
- Points, streak and unlock logic live only in `lib/points.ts`, `lib/streak.ts` and a progression helper. No scattered point math in components.
- Accessibility: every interactive element is a real `<button>` or `<a>`, has a visible focus ring, meets 44 px touch target, has an accessible name. Respect `prefers-reduced-motion`.

## Behaviour rules (do not break)
1. **Secrets:** never place the Claude API key or any admin key in client code, the repo, or logs. Use Function environment config and `.env.example` with placeholders only.
2. **No invented facts:** do not make up recycler names, addresses, phone numbers, prices or statistics. Seed recyclers carry `"source": "sample"` and the UI shows a "sample data" notice until replaced by the State Pollution Control Board authorised list. Payouts are always labelled "indicative".
3. **Honesty about status:** only report something as working after running it. If a video does not embed, a model is missing or a service is not connected, say so in the UI (demo mode) and in your report.
4. **Auth:** use Firebase Auth. Never store plaintext or reversible passwords. Security rules: users read and write only their own documents.
5. **Points integrity:** in production, points and payouts are written by Functions, not the client. For the hackathon demo, client writes are allowed but wrapped in `lib/points.ts` so they can be moved server-side.
6. **Rewards page** shows exactly four things: streak, game points, recycle reward points, payout history.
7. **Kids (under 12):** guardian email required, no unmoderated free text, payouts attributed to the guardian, simple language.
8. **Bot safety:** stays on e-waste, recycling, batteries, energy saving and the app. Never asks for OTP, bank details or passwords. Caps `award_points` at 20 per response. Rate limited.
9. **Bilingual:** every screen must be checked in Tamil (Noto Sans Tamil, +30% text length). Missing Tamil keys fall back to English with a console warning.
10. **Videos:** embed with `https://www.youtube-nocookie.com/embed/{id}`. Never redirect to YouTube as the main experience. If an embed fails, show the fallback message and the notes.

## Learning and game rules (single source of truth)
- Learn: 3 levels × 3 modules. Module = video, notes, quiz. **Pass mark 3 of 4.** Module N+1 unlocks after N is passed. Level L+1 unlocks after every module of level L is passed. First pass +20 game points. Level completion +50.
- Games: 6 games × 3 difficulties × 10 levels. **Pass at 60%.** Sequential unlock. Points per correct = 5 + 5 × difficulty, +20 perfect round, half on replays. Items per round = 5 + ceil(level/2).
- Scan: guess first (yes / no / not sure), then photo, then category. +15 points per scored scan (max 5 a day), +10 for a right guess. Confidence below 60% asks for a clearer photo.
- Streak: +1 on the first learning action of each day, resets after a missed day.
- Recycle reward points: booking +100, completed pickup +300 plus a payout entry.

## Definition of done (every task)
- Works at 360 px, 768 px and desktop widths, in English and Tamil, for kid and senior themes.
- Unit tests for new logic (points, unlocks, seeded game builders, i18n fallback).
- No console errors. Lint and type-check clean.
- Copy and colours follow `DESIGN.md`.
- A short note in the PR: what changed, how you tested, what is still a placeholder.

## Pull request template (use for every PR)
```
## What
<one paragraph>

## Why
<problem it solves, link to PRD requirement ID>

## How I tested
- [ ] npm run lint && npm run test
- [ ] Manual: <screens and flows tried, languages, age themes>
- [ ] Playwright smoke: <pass/fail>

## Placeholders / not done
<sample recyclers, unverified videos, sandbox services, etc.>

## Screenshots
<mobile + desktop, English + Tamil>
```

## Things that are intentionally placeholders until the team provides them
- `TM_MODEL_URL`: the owner's Teachable Machine model (class names listed in `AGENT_PROMPT.md` section 10).
- `BOT_URL` or the Function: teammate's bot, contract in `AGENT_PROMPT.md` section 13.
- Authorised recycler list and real payout rates.
- Tamil translations of lessons and quizzes (agent drafts them, a native speaker reviews).
- Video IDs in `videos.json` (verify each embeds and has acceptable content).
