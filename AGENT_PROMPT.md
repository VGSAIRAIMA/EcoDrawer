# EcoDrawer: Master Build Prompt

> Paste this whole file into your AI coding agent as the first message. Keep `AGENT.md`, `DESIGN.md` and `PRD.md` in the repo root so the agent can read them. A working single-file prototype (`index.html`) already exists. Use it as the behavioural reference: port its data (modules, quiz banks, items, categories) and its flows, then rebuild it properly with the stack below.

---

## 0. Your role and the goal

You are a senior full-stack engineer and product designer. Build **EcoDrawer**, a bilingual (English + Tamil), age-adaptive e-waste awareness web app with a built-in chatbot, an image classifier, six learning games, video lessons with quizzes, recycler discovery and pickup scheduling, and a rewards system.

It answers hackathon problem **P15 E-Waste Awareness (Track 4: Batteries, Energy and Awareness)**:

> "How might we design an engaging, personalised solution (a game, quiz, app, chatbot or campaign tool) that teaches what e-waste is, why improper disposal is harmful and where to recycle it?"
> Must show: (1) the learning experience for one user, (2) how it is personalised or made engaging, (3) a way to measure change in awareness. Impact measure: improvement in quiz score or pledge count; expected reach.

Work in phases (section 17). After each phase, run the app, check the acceptance criteria and tell me what works and what does not. Do not claim something works until you have run it.

## 1. Problem

- Most students and citizens do not know **which items are e-waste**, **why improper disposal is harmful**, or **where authorised recyclers are**.
- Existing campaigns are not engaging or personalised: a poster or a lecture changes nothing.
- People keep dead gadgets in a drawer or give them to scrap dealers who burn or acid-wash them. Lead, mercury, cadmium and lithium then enter soil, water and air.
- Nobody tells people that old devices have value, or books the pickup for them.

## 2. Solution in one paragraph

EcoDrawer starts with a short knowledge test, personalises the experience by **age group, language and weak topics**, then teaches through **video modules with pass-mark quizzes**, **six levelled games** (3 difficulties × 10 levels), and a **photo scanner** that first asks "is this e-waste?" and then categorises the item. A **bot** on every screen answers doubts (website and WhatsApp). Users **find recyclers, schedule a pickup, get reminders**, earn **game points** and **recycle reward points**, keep a **daily streak** and see a **payout history**. Awareness change is measured by comparing the **pre-quiz and post-quiz** scores.

## 3. Users and personas

| Group | Age | What they need |
|---|---|---|
| Kid | under 12 | Mascot, very simple words, big buttons, drag-and-tap games, no free-text surprises |
| Teen | 13-18 | Fast games, streaks, school/college competition, meme-level facts |
| Adult | 19-59 | Payout estimate, pickup booking, legal facts (EPR), efficiency |
| Senior | 60+ | Large text, high contrast, simple navigation, voice/WhatsApp-first, local language |

## 4. Feature list

1. Signup/login with username, email, password (plus Google sign-in).
2. 10-question onboarding (profile + knowledge pre-quiz + habits + location).
3. Home with a **carousel** (4 cards), streak chip, profile menu, "Book your recycler" cards, floating bot button.
4. **Learn**: 3 levels (Beginner, Intermediate, Advanced), 3 modules each. Every module = embedded YouTube video (plays inside the page) → key-point notes → quiz with a pass mark (3 of 4). Sequential unlocking.
5. **Play**: 6 games × 3 difficulties × 10 levels with 60% pass mark and sequential unlocking.
6. **Scan**: guess first ("is this e-waste?"), then photo → classifier → category, hazards, disposal route, payout, book-pickup shortcut. Right guess gives bonus points.
7. **Schedule**: calendar, booking form, booked-state display, Google Calendar link, `.ics` reminder, recycler list with navigate buttons, reminders.
8. **Bot** on every screen with context-aware quick prompts, awarding points for learning questions, supervising the user (streak nudges, pickup follow-ups, weak-topic revision).
9. **Rewards** (inside the person menu): streak, game points, recycle reward points, payout history only.
10. **Profile** and **Settings** (inside the person menu).
11. **Bilingual** (English + Tamil) and **age-based personalisation** across UI, content and bot.
12. **Awareness measurement**: pre vs post quiz, shown in Profile and Learn.

## 5. Tech stack (build this)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React + Vite + TypeScript**, React Router | Fast to scaffold, component reuse |
| Styling | **Tailwind CSS** with the tokens in `DESIGN.md` | Quick, consistent |
| State | Zustand (or React Context) | Small, simple |
| i18n | **i18next** + `react-i18next` (`en.json`, `ta.json`) | Bilingual |
| Auth + DB | **Firebase Auth** + **Firestore** | Free tier, secure password handling |
| Bot backend | **Firebase Cloud Function** (or Netlify Function) calling the **Claude API** | Keeps the API key off the client |
| Classifier | **Teachable Machine** image model exported to **TensorFlow.js** (`@teachablemachine/image`) | No training infra needed; runs in the browser |
| Maps | Google Maps search links (MVP) and **Leaflet + OpenStreetMap** for the in-app map | No billing required |
| Video | YouTube **embed** (`youtube-nocookie.com/embed/ID`), never a redirect | Plays inside the page |
| Calendar | Google Calendar template URL and `.ics` download | No OAuth needed |
| WhatsApp | **Twilio WhatsApp Sandbox** for the demo, WhatsApp Business API for production | Sandbox works in minutes |
| PWA | `vite-plugin-pwa` (installable, offline shell) | Works on cheap phones |
| Hosting | Firebase Hosting or Netlify | Free |
| Tests | Vitest + React Testing Library, Playwright smoke test | Prove it works |

Hackathon fallback: if time is very short, keep everything in one `index.html` like the prototype, with `localStorage` instead of Firebase, and wire only `BOT_URL` and `TM_MODEL_URL`.

## 6. Architecture

```
 ┌──────────────────────────── Browser (React PWA) ────────────────────────────┐
 │ Screens: Auth · Onboarding · Home · Learn · Play · Scan · Schedule ·        │
 │          Profile · Rewards · Settings          + floating EcoBot panel      │
 │ i18n (en/ta) · age theme · points/streak engine · game engines             │
 │ TF.js classifier (Teachable Machine model, runs on-device)                  │
 └───────┬───────────────────────┬──────────────────────────┬──────────────────┘
         │ Firebase SDK          │ HTTPS POST /bot          │ embeds / links
         ▼                       ▼                          ▼
 ┌───────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
 │ Firebase Auth │     │ Cloud Function: bot  │     │ YouTube embeds,      │
 │ Firestore     │◄────┤ - builds system      │     │ Google Maps/Calendar │
 │ (users,       │     │   prompt from profile│     │ links                │
 │  bookings,    │     │ - calls Claude API   │     └──────────────────────┘
 │  payouts,     │     │ - returns reply +    │
 │  progress)    │     │   actions            │     ┌──────────────────────┐
 └───────────────┘     └──────────┬───────────┘     │ Twilio WhatsApp      │
                                   ▲                 │ Sandbox webhook ─────┼──► same bot function
                                   └─────────────────┴──────────────────────┘
```

Rules: the Claude API key lives only in the Cloud Function environment. The browser never sees it. All rewards and payouts are written by trusted code paths (a Cloud Function in production) so users cannot give themselves points. For the hackathon demo, client-side writes are acceptable if labelled as such.

## 7. Data model (Firestore)

```
users/{uid}
  username, email, ageGroup: "kid|teen|adult|senior", language: "en|ta",
  habit, gadgetCount, city, pincode,
  preScore (0-5), postScore (0-5|null), weakTopics: string[],
  gamePoints, rewardPoints, streak, bestStreak, lastActiveDate, activeDays: string[],
  settings { notifications, largeText, demoUnlock },
  guardian { email } // required when ageGroup == "kid"
users/{uid}/moduleProgress/{moduleId}   { bestScore, passed, passedAt }
users/{uid}/gameProgress/{game_difficulty} { highestLevelCleared }   // e.g. "swipe_2" = 7
users/{uid}/bookings/{id}   { date, slot, category, mode, recyclerId, status: Booked|Completed|Cancelled }
users/{uid}/payouts/{id}    { date, category, amount, bookingId }
users/{uid}/scanLog/{id}    { date, guess, label, confidence }
recyclers/{id}              { name, area, lat, lng, accepts: string[], phone, authorised: bool, source }
```

## 8. Navigation and screens

**Top bar:** streak chip (left, opens Rewards), logo (centre), person icon (right) → menu sheet: **Profile, Rewards, Settings, Logout**.
**Bottom tabs:** 🏠 Home · 📚 Learn · 🎮 Play · 📷 Scan · 📅 Schedule.
**Floating button on every screen:** "🤖 Talk with EcoBot" (opens a bottom-sheet chat with quick prompts that change per screen).

### 8.1 Auth
Fields: username, email, password (min 6). Tabs: Sign up / Login. Google sign-in. Errors inline. New user → Onboarding; returning user → Home.

### 8.2 Onboarding (10 screens, one question each, progress bar)
| # | Question | Options | Drives |
|---|---|---|---|
| 1 | Age group | Under 12 / 13-18 / 19-59 / 60+ | UI theme, content tone, bot tone, games shown first |
| 2 | Preferred language | English / Tamil | All UI text, bot replies |
| 3 | Which of these is e-waste? | Phone charger / Plastic bottle / Cotton shirt | pre-score, topic "What is e-waste" |
| 4 | Which harmful metals are in old phones and batteries? | Lead and cadmium / Sugar and salt / Gold and silver only | topic "Hazards" |
| 5 | Where should a dead battery go? | Dustbin / Authorised recycler or collection point / Drain | topic "Batteries" |
| 6 | Can e-waste go with kitchen waste? | Yes / No | topic "Disposal" |
| 7 | What is an authorised recycler? | Any scrap shop / Pollution-control-board approved recycler / Phone repair shop | topic "Authorised recyclers" |
| 8 | What do you do with old gadgets now? | Keep in drawer / Throw away / Sell to scrap dealer / Give to recycler | bot tone and nudges |
| 9 | How many dead gadgets are at home? | 0-2 / 3-5 / 6+ | pickup nudges, impact estimate |
| 10 | City and pincode | text | recycler list, Maps queries |

Questions 3-7 form the **pre-quiz** (no feedback shown). Wrong answers become `weakTopics`. Finishing gives +50 game points and starts the streak. Q1 and Q2 apply immediately (theme and language switch before Q3).

### 8.3 Home
Order top to bottom:
1. Welcome line (kids see "Hi {name}! I'm Chip 🤖").
2. **Carousel** (scroll-snap, auto-advance 4.5 s, arrows, dots, swipeable) with 4 cards:
   - **Schedule your recycle day.** If a booking exists the card reads "✅ Booked: {date}, {slot}" and opens the booking.
   - **Lesson of the day.** The next unlocked, unpassed module; "+20 pts".
   - **Resume your game.** Last game, difficulty and next level.
   - **Photo scan.** Opens Scan.
3. **Book your recycler.** Two nearest recyclers with accepted categories and a Book button.
4. Sample/verification notice while using placeholder recyclers.

### 8.4 Learn
- Three tabs: Beginner, Intermediate, Advanced; overall progress bar.
- Level 2 unlocks after all Beginner modules are passed; level 3 after all Intermediate. Within a level, module N+1 unlocks after module N is passed.
- **Module page: Step 1 watch** (embedded YouTube player inside the page), **Step 2 read** (key points; kids get a one-sentence version), **Step 3 quiz** (4 questions, pass mark **3/4**, feedback after each answer).
- Fail: "Rewatch video" and "Retry quiz". Pass: +20 points the first time, "Next module", +50 bonus when a level is completed.
- "Retake awareness quiz" (the 5 pre-quiz questions) updates `postScore`; +100 points if it improved.

### 8.5 Play
- Grid of 6 games with progress (levels cleared / 30).
- Game page: difficulty tabs (Beginner, Intermediate, Advanced), 10-level grid (✓ cleared, current, 🔒 locked). Pass a level with **60%+** to unlock the next. Replays give half points. A demo switch in Settings unlocks everything for judges.
- Result screen: score, points, Next level / Replay / Back.

### 8.6 Scan (3 steps)
1. **Guess:** "Is the item you are scanning e-waste?" → Yes / No / Not sure.
2. **Photo:** camera or upload, then "Classify this item".
3. **Category result:** one of 8 classes (section 10), confidence, examples, hazards, disposal route, indicative payout, **Book pickup**, **Ask EcoBot**, **Scan another**. Shows whether the guess was right (+10), wrong (explain) or unsure ("now you know"). Scan gives +15 points (max 5 scored scans per day). Confidence under 60% shows "not sure, try a clearer photo" with top-3 guesses.

### 8.7 Schedule
Month calendar (booked dates marked with a dot), tap a date: booking form (category, pickup or drop-off, time slot, recycler, indicative payout) or the existing booking (details, Add to Google Calendar, Download `.ics`, Cancel, "Mark pickup done (demo)"). Below: My bookings, recyclers near you with Navigate buttons, and "Search authorised recyclers near me on Google Maps". Booking gives +100 recycle points. Completion gives +300 recycle points and a payout entry. Reminders: in-app notice on the day before and the day of the pickup; push/WhatsApp reminder in production.

### 8.8 Profile (person menu)
Avatar, username, email, age group, language, city and pincode, habit, gadget count, **awareness score before → now**, weak topics, Retake quiz, links to Rewards and Settings.

### 8.9 Rewards (person menu). Only these four things
1. **Streak:** current, best, last 7 days dots.
2. **Game points:** total.
3. **Recycle reward points:** total.
4. **Payout history:** table of date, item category, ₹ amount, with total.
Plus a short "how to earn" table.

### 8.10 Settings (person menu)
Language, age group, pickup reminders toggle, large text toggle, demo unlock toggle, WhatsApp chat button, Logout.

## 9. Lessons: modules, videos, quizzes

Each module has: `id`, level, title, `video` (YouTube ID, embedded), `videoTitle`, 4 key points, a one-sentence simple version for kids, 4 quiz questions, pass mark 3/4. The full question text is in the prototype's `MODULES` array. Port it as JSON and translate it to Tamil.

| Level | Module | Video ID (embed) | Video title |
|---|---|---|---|
| Beginner | B1 What is e-waste? | `YTcjXtNyWVA` | What is e-waste? (KITAR MCMC) |
| Beginner | B2 Why e-waste is harmful | `OTqgYvNSA4c` | E-Waste Is Poisoning Malaysia And Thailand |
| Beginner | B3 E-waste or normal waste? | `HV2Ir1e513o` | e-Waste |
| Intermediate | I1 Batteries: handle with care | `b7XDjtxdPes` | Why lithium-ion batteries don't belong in your recycling or garbage bins |
| Intermediate | I2 Phones and laptops | `tf4dbYfJkOY` | How Are Electronics Recycled? |
| Intermediate | I3 Hidden treasure in e-waste | `PcvN0TWw1mw` | Hunting For Gold In E-waste |
| Advanced | A1 E-Waste Rules 2022 | `zsRCCzKsH2A` | E-Waste Management Rules, 2022 |
| Advanced | A2 EPR explained | `yv2NZwiBf8s` | EPR for E-Waste Explained |
| Advanced | A3 Inside a recycling plant | `w0ikFMTuS9c` | How e-Waste Is Recycled |

**Video caveats (the agent must handle these):** these IDs came from YouTube search results, and embeddability was not verified. Build the player so that (a) the ID is one config field per module, (b) if a video fails to load, show a friendly "This video is unavailable, read the notes below" message, and (c) keep a `videos.json` that the owner can edit without touching code. Prefer videos with Tamil captions or provide Tamil notes. Optional upgrade: use the YouTube IFrame API and enable the quiz only after `onStateChange === ENDED` or 80% watched.

## 10. Classifier (photo scan)

Teachable Machine **Image Project (standard)**, 8 classes. **Class names must match exactly**:

| Class | Examples | Hazard summary | Disposal route | Indicative payout (demo) |
|---|---|---|---|---|
| Mobile & IT | phones, laptops, tablets, routers, printers, keyboards | lead, lithium, flame retardants, personal data | wipe data, brand take-back or authorised recycler | ₹50-3,000 |
| Batteries | phone/laptop batteries, power banks, button cells, inverter batteries | lithium fire risk, lead, cadmium, acid | never in dustbin, authorised recycler or battery collection point | ₹10-300 |
| Chargers & Cables | chargers, USB cables, adapters, remotes | flame-retardant plastics, copper, PVC | box them, authorised recycler | ₹5-30 |
| Lighting | CFL, tube lights, LED bulbs | mercury (CFL/tube), electronics (LED) | keep unbroken, authorised recycler or drive | ₹0-10 |
| Large Appliances | fridge, washing machine, AC, microwave | refrigerant gases, oils, heavy metals | brand exchange or authorised pickup | ₹300-3,000 |
| Small Appliances | mixer, iron, hair dryer, toaster, kettle | copper wiring, PVC, flame retardants | authorised recycler or drive | ₹20-200 |
| Audio & Video | TV, speakers, earphones, cameras | lead (old CRT), flame retardants, batteries | brand take-back or authorised recycler | ₹10-800 |
| Not E-Waste | plastic, paper, glass, food, clothes | none | regular wet/dry bins | none |

Training guidance: 40+ photos per class, varied angles, lighting and backgrounds, include hands and cluttered tables, include look-alikes in "Not E-Waste" (plastic toys, steel boxes). Export, then set `TM_MODEL_URL` (must end with `/`). The code loads `model.json` and `metadata.json`, runs `predict(img)` and sorts by probability. Also support a custom function `window.ECO_CLASSIFIER(img) → [{label, prob}]`. Without a model the screen runs in **demo mode** (a dropdown to preview results) and says so plainly.

## 11. Games (6 games × 3 difficulties × 10 levels)

Pass = 60% or more correct (Recycle Dash: reach the target; Memory Match: finish). Points per correct answer: 5 + 5×difficulty, +20 for a perfect round, half points for replays of cleared levels. Items per round: 5 + ceil(level/2) (6 to 10). Question timer shrinks with level and difficulty.

| Game | Mechanic | Beginner | Intermediate | Advanced |
|---|---|---|---|---|
| Swipe Sort | swipe or tap: e-waste vs normal waste | everyday items, 12 s | adds CFL, fridge, router, 8 s | adds LED, inverter battery, tricky non-e-waste, 6 s |
| Myth vs Fact | true or false statement with explanation | basic myths, 25 s | legal and data myths, 18 s | science and policy facts, 12 s |
| Bin Match | send item to ♻️ authorised recycler, 🔁 reuse/donate/exchange, 🍌 wet, 📦 dry | obvious items | mixed, working vs dead devices | swollen batteries, cartridges, edge cases |
| Toxic Detective | pick the hazardous substance inside an item | mercury, lead, lithium | adds cadmium, acid, flame retardants | adds refrigerant gases, Ni-Cd tools |
| Recycle Dash | falling items, tap e-waste, avoid normal waste, 3 lives, 40 s | slow, few items | faster, more items | fast, more decoys |
| Memory Match | match item to its hazard | 4 to 8 pairs, with icons | names only | names only, cards flip back fast |

Level N is playable only after N-1 is cleared, unless demo unlock is on. Seeded randomness (per game, difficulty, level) so a level is reproducible. Question banks are in the prototype (`ITEMS`, `MYTHS`, `BINITEMS`, `TOX`, `MEM`). Port and translate them.

## 12. Rewards and points

Two currencies, never mixed:
- **Game points** (learning): onboarding +50; module first pass +20; level completion +50; game rounds as above; scan +15 (+10 for a right guess, max 5 scored scans a day); bot learning question +5 (max 3 a day); post-quiz improvement +100.
- **Recycle reward points** (real-world action): booking +100; pickup completed +300 (and a ₹ payout entry); cancelling a booking removes the 100.
- **Streak:** increases by 1 on the first learning action of each calendar day; resets if a day is missed.
- **Payout:** estimated from the category's indicative range; on completion store the confirmed amount from the recycler. Payouts for kids go to the guardian's account. Never display a guaranteed rate: label as "indicative, final rate set by the partner recycler".

## 13. Bot (EcoBot)

**Where:** floating button on every screen (website) and a WhatsApp number (sandbox now).

**What it does:** answers e-waste doubts; explains the current lesson simply; quizzes the user; gives hints in games; classifies an item described in text; estimates payouts; finds the nearest recycler and tells the user to open Schedule; helps book a date; suggests the next game or module; celebrates streaks; **supervises** the user (below).

**Supervision rules (run on every message and on a daily scheduled job):**
- Read profile: weak topics, streak, last active date, pending booking, pass/fail history.
- Streak about to break: nudge one short activity.
- Booking tomorrow or today: reminder and checklist (data wiped, battery taped, items boxed).
- Repeated wrong answers on a topic: re-teach that topic before suggesting new content.
- Habit "keeps in drawer" or gadget count 6+: encourage a pickup booking.
- Habit "throws away": gentle warning with the reason, never shaming.
- Stay on topic (e-waste, recycling, batteries, energy, this app). Politely refuse the rest.
- Age-appropriate: kids get short, simple, positive answers, no scary detail. Seniors get short, clear steps.
- Reply in the user's language (English or Tamil).

**Contract (website to bot):**
```
POST {BOT_URL}
{ "message": "string", "history": [{"who":"me|bot","text":"..."}],
  "user": { "name","ageGroup","language","city","pincode","weakTopics":[],
            "preScore","postScore","streak","gamePoints","rewardPoints",
            "nextBooking":{"date","slot","category"}|null,"lessonOfTheDay":"string" },
  "screen": "home|learn|play|scan|schedule|rewards|profile|settings" }
→ { "reply": "string", "actions": [ {"type":"open_tab","tab":"schedule"},
                                    {"type":"award_points","points":5} ] }  // actions optional
```
Server rules: validate input, cap `award_points` at 20, rate-limit per user, never trust the client for points in production.

**System prompt template (server builds it):**
```
You are EcoBot, a friendly e-waste teacher inside the EcoDrawer app in India.
Only discuss e-waste, recycling, batteries, energy saving and how to use EcoDrawer.
Reply in {language}. The user is in the {ageGroup} age group: {ageStyle}.
Keep answers short (max 4 sentences) unless asked for more. Use simple words.
Facts you can rely on: e-waste has a plug, battery or circuit board; it contains lead, mercury,
cadmium and lithium; never burn it; never put batteries in the dustbin; wipe data before
recycling; use authorised recyclers (approved by CPCB or the State Pollution Control Board);
India's E-Waste (Management) Rules, 2022 apply from 1 April 2023 and use EPR for producers.
If unsure, say so. Never invent recycler names, prices or phone numbers.
User profile: {profileJson}. Weak topics: {weakTopics}. Nudge them gently if relevant.
```

**WhatsApp:** Twilio Sandbox webhook posts to the same function with `screen: "whatsapp"` and a user lookup by phone number (link phone in Settings). Production needs WhatsApp Business API approval (takes days), so say so honestly in the pitch.

## 14. Bilingual support (English + Tamil)

- All UI strings live in `locales/en.json` and `locales/ta.json`. No hard-coded text in components.
- Translate: UI labels, onboarding questions, lesson notes and kid versions, quiz questions and answers, game statements and item names, category descriptions, bot quick prompts, toasts, errors.
- Language is chosen at onboarding Q2, stored in the profile, switchable in Settings (instant, no reload).
- The bot replies in the selected language. Pass `language` in every request.
- Use **Noto Sans Tamil** for Tamil text. Allow about 30% text expansion in layouts. Test every screen in Tamil.
- Fallback: any missing Tamil key falls back to English and logs a warning.
- Videos: prefer Tamil-captioned videos or add Tamil summary notes under each video.
- Format dates and numbers by locale (`en-IN`, `ta-IN`).
- Stretch: Hindi and Telugu use the same mechanism (add a JSON file).

The prototype `index.html` only stores the language and sends it to the bot. It does not translate the UI yet. The full build must.

## 15. Age-based personalisation

| Aspect | Kid (under 12) | Teen (13-18) | Adult (19-59) | Senior (60+) |
|---|---|---|---|---|
| Base font | 17 px, rounded, big targets | 16 px | 16 px | 19-20 px, high contrast |
| Mascot | Chip the robot greets, cheers | small | none | none |
| Lesson text | one simple sentence | key points | key points + legal context | key points, short steps |
| Games first | Bin Match, Swipe Sort | Recycle Dash, Toxic Detective | Myth vs Fact, Swipe Sort | Swipe Sort, Myth vs Fact |
| Timers | longer or off | normal | normal | longer, optional |
| Bot tone | playful, very short | casual, quick | direct, factual | calm, step by step, voice option |
| Rewards | stickers, points | streaks, leaderboard | payouts, bookings | payouts, bookings |
| Safety | guardian email, payouts to guardian, moderated bot | normal | normal | scam-aware: never ask for OTP or bank PIN |
| Entry | school code optional | school/college league | pickup first | WhatsApp-first |

Implementation: a `theme` object chosen from `ageGroup` sets CSS variables (font size, radius, spacing), content variant selectors, game ordering and the bot `ageStyle` string.

## 16. Measuring impact (what the judges want)

- **Pre vs post awareness score** (5 questions, before onboarding and after learning). Show both, the difference and the cohort average.
- **Pledge count:** a "Drawer Cleared" pledge on the first completed pickup; counter on a public page.
- **Engagement:** modules passed, games cleared, streak length, scans, bookings, kg diverted (estimated from category weights).
- **Expected reach:** state the assumption chain in the pitch (colleges × students × % adoption), labelled as an estimate.
- Provide an admin analytics page (read-only Firestore aggregates) if time allows.

## 17. Build phases and acceptance criteria

**Phase 1: scaffold and data.** Vite + TS + Tailwind, routes, i18n, tokens from `DESIGN.md`, ported data JSON. *Accept:* app boots, language switch works, all routes render.
**Phase 2: auth, onboarding, Home.** Firebase Auth, 10 questions, profile saved, carousel with 4 cards, streak chip, person menu. *Accept:* signup → onboarding → Home persists across reload; theme matches age group.
**Phase 3: Learn.** 3 levels, 9 modules, embedded video, notes, quiz with pass mark, sequential unlocking, bonus. *Accept:* failing a quiz blocks the next module; passing unlocks it; the video plays inside the page.
**Phase 4: Play.** 6 games, 3 difficulties, 10 levels, progression and points. *Accept:* level 2 locked until level 1 cleared; demo unlock opens all.
**Phase 5: Scan.** Guess → photo → classify → category; demo mode and Teachable Machine mode. *Accept:* right/wrong/unsure feedback; low confidence message; Book pickup pre-fills the category.
**Phase 6: Schedule and rewards.** Calendar, booking, `.ics`, Google Calendar link, complete → payout, Rewards page with only the four items. *Accept:* booked state shows on Home card and calendar.
**Phase 7: Bot.** Function + Claude API, floating panel on every screen, contextual prompts, supervision rules, points cap, WhatsApp sandbox. *Accept:* the API key is absent from client code; off-topic questions are refused; replies follow the chosen language.
**Phase 8: polish.** PWA, accessibility, Tamil QA, Playwright smoke test, seed data labelled as sample, README. *Accept:* Lighthouse accessibility 90+, no console errors, all screens usable at 360 px width.

## 18. Hard rules (do not break)

1. Never put the Claude API key, Firebase admin keys or any secret in client code.
2. Never invent recyclers, phone numbers, prices or statistics. Seed recyclers must be labelled "sample" until replaced with the State Pollution Control Board authorised list. Payouts are "indicative".
3. Do not store plaintext passwords. Use Firebase Auth. (The prototype hashes in `localStorage` for demo only.)
4. Do not claim WhatsApp production readiness. The sandbox is a demo.
5. Kids: no unmoderated free text, no collecting more personal data than needed, guardian email required.
6. Do not say a feature works unless you ran it. Report failures plainly.
7. Keep Rewards limited to the four items in 8.9.

## 19. Deliverables

Working repo with README (setup, env vars, how to swap videos, how to train and plug the classifier, how to deploy), `locales/`, `data/` JSON (modules, items, myths, bins, toxic, memory pairs, categories, recyclers), tests, a 2-minute demo script and a one-page pitch summary (problem, solution, impact numbers with assumptions).

Start with Phase 1 now. Show me the plan for the folder structure first, then build.
