# EcoDrawer

A React + TypeScript demo for learning about e-waste and making a responsible next move. This project was bootstrapped from the product brief and design reference in `PRD.md`, `DESIGN.md`, and `AGENT_PROMPT.md`.

## Run locally

```sh
npm install
npm run dev
```

## Verify

```sh
npm run lint
npm run test
npm run build
```

## Demo features

- English and Tamil interface, with kid/teen/adult/senior text personalisation.
- Three lessons with sequential unlocks and a four-question quiz (3/4 pass mark).
- Six mini-game entry points, ten sequential levels per game, and a 60% pass mark. The current demo shares a quiz-style round mechanic across the games.
- Guess-first photo scan with a local, manually selected demo classification.
- Sample pickup/drop-off bookings, an `.ics` reminder, and completion rewards.
- Rewards, profile, settings, and a local e-waste help bot.
- Demo progress is stored in this browser's local storage.

## Honest demo limitations

Authentication, Firebase, a Teachable Machine model, embedded lesson videos, live bot services, verified recycler data, real payouts, and WhatsApp are not connected. The scan and bot are local demonstrations; recycler listings are labelled sample data and payout amounts are not configured. The six games share a quiz-style round rather than their final individual game mechanics. Do not treat demo bookings as real pickup appointments. No API keys or personal data are sent to a service.

For production, connect an authorised recycler source and server-side services, add reviewed Tamil lesson/quiz content, configure verified video IDs, and perform accessibility and privacy reviews before collecting real user information.
