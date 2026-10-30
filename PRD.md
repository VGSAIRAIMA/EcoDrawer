# PRD: EcoDrawer (E-Waste Awareness Platform)

**Owner:** Raima · **Status:** Hackathon build (problem P15, Track 4: Batteries, Energy and Awareness) · **Version:** 1.0

## 1. Background
Most students and citizens do not know which items are e-waste, why improper disposal is harmful, or where authorised recyclers are. Existing campaigns are not engaging or personalised. Dead gadgets sit in drawers or reach informal dealers who burn or acid-wash them, releasing lead, mercury, cadmium and lithium into soil, water and air.

## 2. Product vision
EcoDrawer makes e-waste learning feel like a game and ends with a real action: a booked recycling pickup. It teaches, personalises, rewards and measures.

## 3. Goals and non-goals
**Goals**
- G1: Teach what e-waste is, why improper disposal harms, and where to recycle, to users of all ages in English and Tamil.
- G2: Personalise by age group, language and weak topics.
- G3: Drive a real-world action (book a pickup) with clear, honest incentives.
- G4: Measure change in awareness (pre vs post quiz, pledges, engagement).
- G5: Provide an always-available bot on the website and WhatsApp.

**Non-goals (v1)**
- Handling real payments or wallet payouts (payouts are indicative and tracked in history).
- Operating a recycler marketplace or logistics fleet.
- Legal compliance advice beyond educational facts.
- Native mobile apps (PWA instead).

## 4. Personas
| Persona | Need | Success looks like |
|---|---|---|
| Kid (under 12) | Fun, simple, safe | Plays Bin Match daily, finishes Beginner modules |
| Teen (13-18) | Competition, speed | Keeps a streak, clears Advanced game levels |
| Adult (19-59) | Value and convenience | Books a pickup within the first week |
| Senior (60+) | Clarity and large text | Uses WhatsApp bot, books via simple steps |

## 5. User journey (one user)
1. Sign up (username, email, password) → 2. 10 onboarding questions (age, language, 5-question pre-quiz, habits, location) → 3. Home carousel shows the next lesson, the schedule card, the resume-game card and the scan card → 4. Watches a video, reads notes, passes the quiz → 5. Plays levelled games for points and streak → 6. Scans an item: guesses, then sees its category and disposal route → 7. Books a pickup, gets reminders → 8. Pickup completed: recycle points and a payout entry → 9. Retakes the awareness quiz and sees the improvement.

## 6. Functional requirements

### Accounts and onboarding
| ID | Requirement | Priority |
|---|---|---|
| F-01 | Signup/login with username, email, password; Google sign-in | Must |
| F-02 | 10-question onboarding: age group, language, 5 knowledge questions, habit, gadget count, city and pincode | Must |
| F-03 | Store pre-score and weak topics from onboarding | Must |
| F-04 | Kids require a guardian email | Must |

### Home
| F-05 | Sticky top bar: streak chip, logo, person icon menu (Profile, Rewards, Settings, Logout) | Must |
| F-06 | Carousel with 4 cards (Schedule, Lesson of the day, Resume game, Photo scan): auto-advance, swipe, arrows, dots | Must |
| F-07 | Schedule card shows "Booked" with date once a booking exists | Must |
| F-08 | "Book your recycler" cards for the nearest recyclers | Must |
| F-09 | Floating "Talk with EcoBot" button on every screen | Must |

### Learn
| F-10 | 3 levels (Beginner, Intermediate, Advanced) with 3 modules each | Must |
| F-11 | Module = embedded video (plays in page) → key points → quiz | Must |
| F-12 | Quiz pass mark 3/4; failing blocks the next module; retry and rewatch allowed | Must |
| F-13 | Sequential unlocking within and across levels | Must |
| F-14 | +20 points on first pass; +50 on level completion | Should |
| F-15 | Retake awareness quiz; show pre vs post | Must |

### Play
| F-16 | 6 games: Swipe Sort, Myth vs Fact, Bin Match, Toxic Detective, Recycle Dash, Memory Match | Must |
| F-17 | Each game has Beginner, Intermediate, Advanced, each with 10 levels | Must |
| F-18 | Pass at 60%; next level unlocks; replays give half points | Must |
| F-19 | Seeded, reproducible levels; timers tighten with level | Should |
| F-20 | Demo unlock switch for judges | Should |

### Scan
| F-21 | Step 1: ask "Is this e-waste?" (yes / no / not sure) before scanning | Must |
| F-22 | Step 2: camera or upload; classify with a Teachable Machine model | Must |
| F-23 | Step 3: show category (8 classes), hazards, disposal route, indicative payout, Book pickup, Ask EcoBot | Must |
| F-24 | Compare the guess with the result; +10 bonus for right guess | Should |
| F-25 | Confidence below 60% asks for a clearer photo | Should |
| F-26 | Demo mode when no model is connected, clearly labelled | Must |

### Schedule and recyclers
| F-27 | Month calendar with booked dates marked | Must |
| F-28 | Booking: category, pickup or drop-off, time slot, recycler | Must |
| F-29 | Add to Google Calendar link and `.ics` download | Should |
| F-30 | Reminders the day before and on the day (in-app now, WhatsApp/push later) | Should |
| F-31 | Recycler list with Navigate buttons and a Google Maps search for authorised recyclers near the pincode | Must |
| F-32 | Mark pickup completed → +300 recycle points and a payout entry | Must |

### Rewards, profile, settings
| F-33 | Rewards page shows only streak, game points, recycle reward points, payout history | Must |
| F-34 | Streak logic: +1 per active day, reset on a missed day | Must |
| F-35 | Profile shows details and awareness score before → now | Must |
| F-36 | Settings: language, age group, reminders, large text, demo unlock, WhatsApp link, logout | Must |

### Bot
| F-37 | Chat panel on every screen with context-aware quick prompts | Must |
| F-38 | Answers e-waste doubts in the user's language and age style | Must |
| F-39 | Receives user profile with each message; supervises (streak nudges, pickup follow-ups, weak-topic revision) | Should |
| F-40 | Awards +5 points for up to 3 learning questions a day; actions limited to open_tab and award_points | Should |
| F-41 | Same bot on WhatsApp (sandbox for demo) | Should |

### Bilingual and personalisation
| F-42 | English and Tamil for all UI, content, quizzes, games and bot | Must |
| F-43 | Age themes: font size, shapes, mascot, content variant, game order, bot tone, safety | Must |

## 7. Non-functional requirements
- **Performance:** first load under 3 s on 4G; interactions under 100 ms; classifier runs on-device.
- **Accessibility:** WCAG 2.1 AA, large-text mode, keyboard support, reduced-motion support.
- **Privacy and security:** secrets server-side only; per-user Firestore rules; minimal data on children; photos are classified on-device and not uploaded in v1.
- **Reliability:** graceful fallbacks (video unavailable, model missing, bot offline reply).
- **Compatibility:** Chrome, Edge, Safari, Firefox current versions; 360 px phones and up; installable PWA.
- **Localisation:** English and Tamil with fallback and layout tolerance.

## 8. Success metrics
| Metric | How measured | Demo target |
|---|---|---|
| Awareness gain | post-quiz minus pre-quiz score | average +1.5 of 5 or better |
| Module completion | modules passed per user | 3+ in first session |
| Engagement | streak length, games cleared per week | 3-day streak median |
| Action | pickup bookings per 100 users | 10+ |
| Pledges | "Drawer Cleared" pledges | counter on a public page |
| Reach (estimate) | colleges × students × adoption % | stated as a labelled assumption |

Targets are hypotheses to validate in the pilot, not claims.

## 9. Scope for the 2-hour hackathon demo
**In the demo:** all screens, 9 modules with embedded videos, 6 games, scan with demo mode or the real model, booking with `.ics`, rewards, a bot (local demo replies or the teammate's endpoint), English UI with the language stored and passed to the bot.
**Shown as roadmap:** Firebase backend, real recycler data, WhatsApp production API, push reminders, Tamil UI translation, server-side points, admin analytics.

## 10. Dependencies
- Teammate delivers the bot endpoint (contract in `AGENT_PROMPT.md` section 13).
- Owner trains the Teachable Machine model (8 classes, names exact).
- Authorised recycler list from the State Pollution Control Board.
- Tamil translations reviewed by a native speaker.
- Verified, embeddable YouTube videos (IDs in the module table).

## 11. Risks and mitigations
| Risk | Mitigation |
|---|---|
| A video cannot be embedded or is removed | One config field per video, friendly fallback, notes always shown, replace the ID |
| Classifier accuracy is low with few photos | 40+ varied photos per class, "not sure" threshold at 60%, guess-first flow keeps value even when wrong |
| Payout expectations are over-promised | Always "indicative", partner agreement needed before launch |
| WhatsApp production approval takes days | Twilio sandbox for demo, say so openly |
| Points cheating | Server-side writes and caps in production |
| Child safety | Guardian email, no free text unmoderated, minimal data |
| Tamil translation quality | Native review before release |
| Placeholder recyclers mistaken for real | "Sample" labels until replaced |

## 12. Open questions
1. Which partner recyclers and brands will confirm payout rates?
2. Is school/college league data needed for the leaderboard (privacy rules for minors)?
3. Should Hindi and Telugu be added in v1.1?
4. Which pledge wording and public counter will be used?

## 13. Release plan
v0.1 prototype (done, single file) → v0.2 React rebuild with Firebase → v0.3 bot and WhatsApp sandbox → v0.4 Tamil and age themes → v1.0 pilot in colleges with real recyclers.
