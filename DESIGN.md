# DESIGN.md: EcoDrawer Design System (Green / Waste-Reuse Theme)

Mood: fresh, hopeful, tactile. Think recycled paper, leaves and clean tech. Friendly for kids, calm for seniors, credible for judges. The prototype `index.html` already uses these tokens.

## 1. Design principles
1. **One idea per screen.** Big headline, one primary action.
2. **Play, not lecture.** Rewards, progress bars and motion give constant feedback.
3. **Green means go.** Green = correct, safe, progress. Amber = streak and attention. Red = wrong or hazard. Never use red for decoration.
4. **Everyone can use it.** Large touch targets, readable contrast, works in Tamil and English, adapts to age.
5. **Honest UI.** Sample data and demo mode are always labelled.

## 2. Colour tokens
| Token | Hex | Use |
|---|---|---|
| `--forest` | `#0B3D2E` | headings, logo, dark buttons, bot header |
| `--leaf` | `#15803D` | primary buttons, active tab, links |
| `--sprout` | `#22C55E` | progress fills, success accents, "Eco" highlight |
| `--mint` | `#E1F2E7` | secondary buttons, chips, tab track |
| `--paper` | `#F2F9F4` | page background (recycled-paper tint) |
| `--card` | `#FFFFFF` | cards |
| `--ink` | `#14231B` | body text |
| `--muted` | `#5B6F64` | secondary text |
| `--amber` | `#F59E0B` | streak flame, current level, timer bar |
| `--amber-soft` | `#FFF4E0` / text `#B45309` | streak chip |
| `--danger` | `#E11D48` | wrong answers, hazards |
| `--danger-soft` | `#FEE2E2` | wrong feedback |
| `--ok-soft` | `#DCFCE7` | correct feedback |
| `--sky` | `#4059B8` | carousel card 1 (schedule) |
| `--violet` | `#6D28D9` | carousel card 4 (scan) |

Carousel gradients: Schedule `#6D83D9 → #4059B8`, Lesson `#22C55E → #0F766E`, Games `#FB923C → #E11D48`, Scan `#A855F7 → #6D28D9`.

Contrast: body text on paper and cards must be 4.5:1 or better. White text on `--leaf`, `--forest`, the carousel gradients and `--danger` all pass. Never put `--muted` on a gradient.

Dark mode (optional): background `#0E1B15`, card `#15271F`, ink `#E8F3EC`, keep `--leaf` and `--sprout`.

## 3. Typography
- **Poppins** (400, 600, 800) for English, **Noto Sans Tamil** (400, 600, 700) for Tamil. Fallback: system UI.
- Scale: H1 28 / 1.2, H2 20, H3 17, body 16, small 14, caption 12.
- Senior theme: base 19-20 px. Kid theme: 17 px with rounder shapes.
- Tamil needs 1.5 line height and about 30% extra width. Never truncate Tamil labels, wrap them.

## 4. Shape, spacing, elevation
- Radius: cards 18 px (kid 28), buttons 14, chips 999, carousel slides 24, video frame 16.
- Spacing scale: 4, 8, 12, 16, 24, 32. Page gutters 16. Card padding 16.
- Shadows: card `0 2px 10px rgba(11,61,46,.08)`, floating `0 6px 18px rgba(11,61,46,.33)`, top bar `0 1px 8px rgba(11,61,46,.07)`.
- Touch target at least 44 × 44 px. Bottom nav items at least 56 px tall.

## 4a. Iconography and imagery
- Emoji for fast, friendly icons in the prototype. In the full build use one icon set (Lucide) in leaf green plus the emoji category icons (📱 🔋 🔌 💡 🧊 🍳 📺 🚯).
- Mascot **Chip the robot**: a small green recycling-symbol robot. Appears for kids on Home, in the bot, and on result screens. Optional for teens, hidden for adults and seniors.
- Illustration style: flat shapes, soft shadows, leaf and circuit-board motifs. Subtle circuit-trace pattern on the paper background at 4% opacity.

## 5. Layout
- Mobile first at 360 px, content column max 760 px centred on desktop.
- **Top bar (sticky):** streak chip left, logo centre ("Eco" ink + "Drawer" sprout), avatar right.
- **Bottom nav (fixed, 5 tabs):** Home, Learn, Play, Scan, Schedule. Active tab leaf green and bold. Safe-area padding on phones.
- **Floating bot button:** forest background, white text, bottom-right above the nav.
- **Bot panel:** bottom sheet 76% height, forest header, white message bubbles, leaf-green user bubbles, quick-prompt chips above the input.
- **Person menu:** bottom sheet with Profile, Rewards, Settings, Logout.

## 6. Components
| Component | Spec |
|---|---|
| Primary button | leaf background, white text, 600 weight, radius 14, press scale .97 |
| Secondary button | mint background, forest text |
| Danger button | `--danger-soft` background, `#B91C1C` text |
| Card | white, radius 18, soft shadow, 16 padding |
| Chip | mint background, 12-13 px semibold; warning chip amber-soft |
| Carousel | scroll-snap, 1 card per view, auto-advance 4.5 s, arrows, pill dots (active dot is wide and leaf green), pause on touch |
| Progress bar | 10 px, track `#DCECE2`, fill sprout, rounded |
| Timer bar | 6 px amber, shrinks right to left |
| Quiz option | white, 2 px mint border, radius 14; correct = ok-soft + leaf border; wrong = danger-soft + danger border |
| Feedback strip | rounded 14, ok-soft or danger-soft, one sentence of explanation |
| Level grid | 5 columns, square tiles: done = sprout + ✓, current = amber, locked = grey + 🔒 |
| Video frame | 16:9, radius 16, shadow, black letterbox, title caption underneath, fallback message if blocked |
| Calendar | 7-column grid, today = sprout ring, booked = blue tint + dot, selected = leaf fill, past dates dimmed |
| Result card | big emoji, headline, score, "+N points" in leaf, stacked buttons |
| Notice box | amber tint `#FFFBEB`, border `#FCD34D`, used for sample-data and demo-mode messages |
| Toast | forest pill, white text, top centre, 2.4 s |

## 7. Motion
- 150-200 ms ease for presses and tab changes. Carousel slides 300 ms.
- Celebrate: confetti burst on module pass and level clear (respect reduced motion).
- Game motion: falling items in Recycle Dash, card flip in Memory Match, swipe tilt in Swipe Sort.
- Streak flame pulses once when the streak increases.
- `prefers-reduced-motion`: disable confetti, pulses and auto-advancing carousel.

## 8. Age themes (variables swapped by `ageGroup`)
| Variable | Kid | Teen | Adult | Senior |
|---|---|---|---|---|
| `--fs` | 17px | 16px | 16px | 19-20px |
| `--r` | 28px | 18px | 18px | 18px |
| Mascot | large | small | off | off |
| Contrast | normal | normal | normal | higher (ink `#0A1510`, borders 2 px) |
| Animation | playful | lively | calm | minimal |
| Nav labels | icon + word | icon + word | icon + word | bigger icon + word, no clutter |

## 9. Screen-by-screen design notes
- **Auth:** big ♻️ logo, tagline "Learn. Play. Recycle. Get rewarded.", segmented Sign up / Login, one card of inputs, Google button below.
- **Onboarding:** one question per screen, progress bar on top, large option buttons, no back-penalty. Q1 and Q2 switch the theme and language immediately.
- **Home:** welcome, carousel, then "Book your recycler" cards. Use whitespace. Do not add extra widgets.
- **Learn:** level tabs, progress bar, module cards with status line (🔒 locked, ▶ ready, ✅ passed with best score).
- **Module:** step labels "Step 1 of 3: watch / read / quiz", video on top, key points in a card, primary "Take the quiz" button with pass mark shown.
- **Play:** 2-column grid of game cards with emoji, one-line description, progress bar and "n/30 levels".
- **Game levels:** difficulty tabs, 10-tile grid, short rule line under it.
- **Scan:** step 1 big question card with 3 stacked answer buttons; step 2 dashed drop zone and photo preview; step 3 result card with category emoji, hazards, route, payout and actions.
- **Schedule:** calendar card, booking panel directly under it, then bookings and recyclers with a sample-data notice.
- **Rewards:** streak card with 7 day dots, two number cards (game points, recycle reward points), payout table. Nothing else.
- **Profile / Settings:** simple cards and tables, toggles at 24 px, destructive actions in danger style.

## 10. Content tone
- English: warm, short, active. "Pass 3 of 4 to unlock the next module."
- Tamil: natural spoken-written register, not literal machine translation. Native speaker review required.
- Kids: playful, one sentence, no fear. Seniors: calm, step by step. Never shame ("You failed"); say "Almost there, try again."
- Numbers: Indian format (₹1,50,000 style) via `Intl`, dates as "2 Nov".

## 11. Accessibility checklist
- 4.5:1 text contrast, 3:1 for UI borders.
- Focus ring 3 px `--sprout` outline, offset 2 px.
- All images and emoji used as meaning have text alternatives. Decorative emoji are `aria-hidden`.
- Quiz feedback uses text and icons, not colour alone.
- Timers can be extended or turned off in Settings for seniors and kids.
- Video has captions on; transcript or notes always present below.
- Works with 200% zoom and landscape orientation.
