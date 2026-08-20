# Status — 2026-08-20

Where the project actually stands, and what to do next. `CLAUDE.md` explains how
the code works; this file explains what is done, what is deliberately not, and
what the next session should pick up.

## Current state

| | |
|---|---|
| Exercises | **353** (146 from reels, 23 Hyrox + gym additions) |
| Routines | 17 |
| Written guides | 24 (6 on food) |
| Programs | 6 |
| Schema | v7 |
| Tests | 208 passing |
| Build | clean under `tsc -b` |
| Install | PWA, boots offline. Not hosted yet |

Verify with `npm test && npm run build` before assuming any of that is still true.

## Done

**Phase 1 — routines.** Timed flow player with wake-lock, audio and haptic cues,
per-side prompts. Morning, evening, flexibility, desk and sauna routines.

**Phase 1b — endurance and recovery.** Swimming and running run through the same
slot machinery via `Slot.distanceRange`; pace is derived. Sauna and cold exposure
use a `'protocol'` pattern the flow player runs unchanged.

**Phase 2 — the Instagram import.** 1,516 saved posts filtered to 296 training
posts. 183 contact sheets fetched and **all 183 reviewed** — ledger closed at
43 new / 17 dup / 3 partial / 120 dud. Five routines were reconstructed from
videos whose captions never named a single movement.

**Figures.** Parametric SVG from joint angles, covering every exercise where a
body position is the point. `'swim'` and `'protocol'` deliberately have none.

**Phase 3 — the phone.** Installable PWA: web manifest, its own icon set, and a
service worker generated at build time by `scripts/buildSW.mjs` that precaches
the built shell. Verified by stopping the server and reloading: the app boots
with no network at all. `base` is `'./'`, so the same build runs from a domain
root or a `/project/` subpath. **Not hosted yet** — that decision is still open.

**Equipment you can actually reach.** `src/data/equipment.ts` is now the single
list Settings renders, grouped Gym / Swimming / Running / Recovery. Before this,
the pool, the treadmill and the sauna shipped switched on but had no toggle
anywhere, and the presets replaced the whole selection — so one tap on
"🏋️ Full gym" deleted every swim, run and sauna round with no way back.
Presets now only speak about gym kit. A type-level assertion in that file fails
`tsc -b` if a new `Equipment` member is added without a home in a group.

**Phase 4 — the coach.** `src/engine/coach.ts`: deterministic rules over your own
history, surfaced as a weekly review at the top of Progress. Pattern gaps ("no
hinge in 12 days"), a lift that has stopped moving, push against pull over 28
days, the routine streak, and how the last three sessions felt. Every insight
carries the number it was computed from, and a test enforces that. With nothing
logged it says "nothing logged yet" rather than inventing encouragement.

**Today suggests, rather than listing.** `suggestRoutine` rotates through the
routines you have gone longest without and says why on the card; the clock
decides whether the morning or the evening one leads. Schema **v5** adds
`Routine.situational`, so the pre-run, pre-swim and post-swim warm-ups stay out
of the daily suggestion — they are structurally 'wake' and 'wind-down' routines,
and offering a pre-swim warm-up on a morning with no swim is a bad suggestion.

**Places.** Home / Gym / Pool / Outdoors, each with its own kit, switched in one
tap. `Place.loadCeilings` is the part that earns it: two 8kg bells at home is a
real constraint, so at the ceiling `suggestLoad` stops adding weight and starts
asking for reps, and says why.

**Goals, phases and the week.** `engine/goals.ts` turns a race date into a phase
(base → build → peak → taper → race week), with a taper length that differs by
event. `engine/week.ts` derives a seven-day plan from your weekly shape, the
phase and your history — never stored, so it cannot go stale. Gym days are
spread rather than clustered and never land the day after the long run. Deloads
every fourth week, but only once there is history to count from. **A goal with
no date gets no countdown** and the app says so instead of inventing a block.

**Nutrition.** Six guides (protein, fuelling, eating around lifting,
supplements, hydration, race morning) plus `engine/fuelling.ts`, which attaches
carbs/hour and before/during/after to any generated session long enough to need
it — and refuses to turn a population range into a number about your body until
you have logged a bodyweight.

**Niggles.** Tick 'knee' in Settings and the generator stops offering deep knee
flexion, exempting anything tagged `rehab`, and names the niggle when it empties
a slot. A filter, not a diagnosis; the UI says so.

**The editors.** Programs, days and slots, and routines and steps, are now
editable in the app. `saveProgram` and `saveRoutine` had existed unused since the
first version.

**Navigation.** Five tabs — Today, Plan, Log, Library, Progress. Routines folded
into Plan, Settings moved to a floating button. Exercises now open a **detail
page** (figure, cues, the reel embedded inline, and dosage read from your own
programs) rather than the edit form.

**Cues.** Every one of the 330 exercises now has at least one; 33 standard
movements that shipped with none were written up.

**Usability pass (measured, not eyeballed).** Every screen walked at 375px in
both themes:

- `--text-faint` failed WCAG AA in **both** themes (3.09:1 light, 3.65:1 dark)
  and it carries every explanation line in the app. Now 4.8:1 and 5.6:1.
- **351 tap targets** were under the 44px this codebase claims at the top of
  `index.css` — small buttons at 34, segment tabs at 38, chips at 32, the corner
  button at 40, logger inputs and ticks at 42. Now **zero** under 44.
- The Library rendered **687 interactive elements**, 330 of them delete buttons
  sitting beside 330 tappable cards. Delete moved to the exercise page; the list
  is down to 27.
- The sticky "Finish session" bar covered the last exercise's set rows — the one
  you are logging when you are most tired.
- **Today and Plan disagreed.** Plan scheduled Thursday from a named program
  while Today opened on two dropdowns ignoring it. Today now leads with what the
  week says and demotes the pickers to "do something else instead".
- The corner button showed the current place and opened Settings. It is now a
  place switcher (a bottom sheet, because the corner is not where your thumb is)
  with Settings as its last row, and it hides on Log, where it floated over the
  tick column.
- A repeated reason on every run day made the week a wall to scroll. Each reason
  now shows once, plus always on today.

**Pre-flight before publishing.** A pass over what a public repo would actually
expose, and what a fresh install would actually do:

- **The captions were being republished whole.** 194,000 characters of other
  people's Instagram writing shipped verbatim in the bundle. Fine on one laptop;
  publishing it is republication rather than reference. `importReels.mjs` now
  stores a **400-character excerpt** with the link back, which the watch queue
  needs just as much and the bundle notices — 249KB → **217KB gzipped**.
- **The import filter kept posts that were not about training.** One stray word
  was enough, so a K-pop fashion post, an explainer on how GPT-3 is
  *pre-trained*, an Osaka restaurant guide and a surveillance-culture thread all
  qualified. Fixed with a **veto** rather than a stricter positive test —
  tightening the positive lexicon silently drops real training posts, which this
  importer has already done once. 296 → 285 sources, 0 exercises orphaned.
  Anything in a collection Toni curated by hand is never vetoed.
- **`\b` does not work against Korean.** `\b맛집\b` can never match, because CJK
  characters are not `\w`. That is how the restaurant guide survived the first
  pass; there is a separate CJK veto now.
- **The full v1 → v6 migration chain was walked with a real old payload.** Own
  exercise, own program, logged session, body metric and custom settings all
  survive; the app gains routines, reels, places and a weekly shape.
- **Backup restore is now tested** (`[B1]`), including the subtle part: an empty
  routine list means "I deleted mine" and stays empty, while a missing one means
  "this backup predates routines" and gets the seeds.
- **Offline was re-verified** with the server stopped after all of the above.
- Checked for secrets, personal data and absolute paths in what would be
  committed: clean.

### Still yours to decide before it goes public

1. **A licence.** There is no LICENSE file, which means all rights reserved by
   default. That is the right answer while the repo is private; it only needs a
   deliberate decision if it ever goes public.
2. **Repo visibility** — settled for now: private. See the hosting section.

**Every figure is posed by hand: 330 of 330.** Each carries its own start/end
(and where the path is not a straight line, a mid) pose, camera angle, props,
and — for 285 of them — the one thing most commonly done wrong. No exercise
inherits a generic pattern default any more.

Written from each drill's own cues rather than its name, and driven by
measurement: an audit of start-to-end travel found figures whose two ends were
identical, so an ab wheel rollout, a psoas march and three carries were drawing
a person standing still. `[F4]` fails the build if any figure freezes that
should not, with an allowlist for the ones that genuinely are held. The metric
counts the head and the toes, because a chin tuck and a calf pump move nothing
else.

The mobility and stretch drills got the most care of the lot: they run in the
morning and evening routines, so they are the most-looked-at pictures in the
app.

**Figures are bodies, and they show you the muscles.** Solid articulated
limbs and a real trunk rather than a stick man, with each exercise's declared
`primaryMuscles` lit brightly and `secondaryMuscles` faintly — mapped onto the
skeleton in `components/figureMuscles.ts` and named underneath. That data was
already there driving the fatigue model; nothing about it is invented. Each
figure is also framed to its own bounds, because a fixed box sized for a lying
pose drew a deadlift at a fifth of the available width.

**Figures are 3D and they move.** `components/figureGeometry.ts` builds the
skeleton in three dimensions and projects it by hand — no WebGL, +1.6KB. Both
limbs, depth-sorted, turnable by dragging, and playable or scrubbable through
the rep. The motion interpolates the start and end poses that were always in
the data; **no trajectory is invented**. Two modelling bugs found by writing
tests for it: abduction has to be applied *before* flexion (rotating a limb
about the forward axis does nothing to an arm already held out in front, which
is why a band pull-apart did not move), and the two sides only swap depth past
90°, not at ±38°.

**A front door and a setup.** First run explains what the app is, then asks the
four things it cannot guess. It is also where **Push/Pull/Legs and Upper/Lower
finally became reachable** — they had existed since the first version, and Today
booked from a default nobody was ever asked about.

**Picking things yourself.** "Stop surprising me" in Settings takes the
best-scoring exercise instead of one of the top few, making Generate repeatable.
"Pick the exercises myself" on Today builds a session straight from the library
with no generator involved.

**23 exercises added**, from the Hyrox stations and their honest substitutes to
the thin patterns (carries went from 3 to 6). Every substitute says in its own
notes that it is a substitute. Adding them exposed a real classification bug:
wall balls and thrusters were 'squat', which let a heavy 4×5 slot serve 100 wall
balls and halved the fatigue model's bias. They are conditioning; there is now a
test that a heavy primary slot can never be filled with a conditioning station.

## Live

**https://flcohort6sc.github.io/trainer/**

Repo: `flcohort6sc/trainer`, **public** (made public on 2026-08-20 so Pages
would work — it is not available for private repos on this plan). Pages builds
from `.github/workflows/deploy.yml`, which **runs the test suite before it
deploys**, so a broken engine never reaches the phone. `dist` stays gitignored;
what is published is always built from source.

Verified on the live site: the service worker registers at scope `/trainer/`,
all ten shell files cache under the subpath, and the page comes back controlled
by the worker on a second visit. `base: './'` is what makes the subpath work —
do not "tidy" it to `/`.

To deploy: push to `main`. To deploy without a change: `gh workflow run deploy.yml`.

**What being public means.** The repo carries 285 reel caption excerpts and their
creator handles. It carries none of your training data — that has never left the
browser and never touches the server. There is no LICENSE file, so it is all
rights reserved by default; that is now a deliberate thing to revisit rather
than an oversight.

Next, and yours: open the site in Safari and use Share → **Add to Home Screen**.

**Honest limits to know before installing:**

- **No scheduled notifications.** A web app cannot fire a reliable local alarm at
  22:30. The streak on Today and the home-screen icon are what exist. An iOS
  Shortcuts automation that opens the app on a timer is the nearest real
  workaround, and it is a setup step on the phone rather than something code can
  do.
- **The phone becomes a second, separate database.** Phone and laptop hold
  independent data, and on iOS the home-screen app very likely has its own
  storage separate from Safari as well — worth checking on the device rather
  than assuming either way. Settings → Export / Import replaces everything, so it
  doubles as device transfer.

## Known gaps, in priority order

1. **No cycling anywhere.** No bike equipment, no `bike` pattern, no brick
   sessions. This is the one hard blocker on the triathlon goal, and the goal
   screen says so rather than pretending otherwise.
2. **Hyrox stations are mostly substitutions.** Four of the eight can be trained
   properly with an ordinary gym (runs, farmers carry, burpee broad jumps,
   sandbag lunges via barbell). SkiErg, rowing, sled and wall balls are
   approximated, and the plan should keep saying which is which.
3. **No `stability-ball` or balance-trainer in `Equipment`.** Three reviewed reels
   are blocked on it (stir-the-pot, ball planks, BOSU push-ups). Fix is a union
   addition, a group in `src/data/equipment.ts` (the build will insist), a
   default-settings entry, and a new `MIGRATIONS` step at the head of the chain.
4. **Redundant entries to prune.** From 2026-08-20 Toni asked me to stop weighing
   near-duplicates and add them anyway. Candidates: Dumbbell Pullover,
   Behind-the-Back Reach, Vertical Leg Hip Lift, Wall-Supported Crunch, Landmine
   Lumberjack. The review ledger notes which were added under that relaxed bar.
5. **Bundle is ~217KB gzipped.** Was 249KB before the captions were excerpted.
   Fine for a PWA that caches once.
6. **`engine-test.ts` has no per-test runner.** Fine at 208 assertions and ~2s.

## Files that are not in this repo

- `../0 Exercise saved posts/` — the raw Meta export. Input to
  `npm run import:reels`.
- `../0 Reel frames/` — 39MB of contact sheets plus `review-ledger.json`,
  `dead.json`, `manifest.json`. Nothing in the app reads from it. The sheets are
  safe to delete; keep the ledger if you want the audit trail of what came from
  where.

## Working agreements

- **Never invent an exercise.** If a source names a topic but not the movement, it
  goes to the watch queue. This is the project's defining constraint.
- **`fetchReels.mjs` is Toni's to run**, not Claude's — it needs their browser
  cookies and the sandbox blocks that, correctly.
- Toni asked to build this together and have design choices explained rather than
  just receiving code.
