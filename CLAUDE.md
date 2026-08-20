# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `STATUS.md` first** — it carries what is done, what is next, and the known
gaps. This file is the architecture; that one is the state of play.

## Commands

```bash
npm run dev            # Vite dev server on :5173
npm test               # engine-test.ts via tsx — the whole suite, ~1s
npm run build          # tsc -b && vite build && the service worker — must stay clean
npm run preview        # serve dist/ on :4173 — the ONLY way to exercise the worker
npm run lint           # oxlint (two pre-existing warnings are expected)
npm run import:reels   # regenerate src/data/reelSources.ts from the IG export
npm run fetch:reels    # download reels -> contact sheets (see below)
```

There is no per-test runner. `engine-test.ts` is a single flat script of ~40
numbered blocks that print PASS/FAIL and exit non-zero on any failure. To run
one block, comment out the others or add an early `process.exit`. It builds its
own `AppData` from the seed files and touches no browser APIs, so it is fast
enough to run on every change.

Never start a dev server with plain `npm run dev` in the background when a
preview tool is available — use the Browser pane tooling instead.

## The core idea

A **program stores requirements, not exercises.** A `Slot` says "knee-dominant
push, 4x5-8, heavy, 180s rest"; the generator fills it at run time from whatever
is in the library and whatever equipment is ticked in Settings. This is why
sessions vary week to week without anyone editing a program, and why an exercise
added from a video becomes eligible everywhere its pattern fits, immediately.

Everything else follows from that. Read `src/types.ts` first — the comments there
carry the reasoning, not just the shapes.

## Architecture

**`src/engine/generator.ts`** — filter -> score -> pick, per slot.
`eligibleFor` narrows by pattern, equipment, difficulty, required muscles/tags;
`scorePool` blends freshness, familiarity, recovery, block fatigue and
loadability; `pick` takes weighted-random from the top few so plans are not
identical every week. `eligibleFor`, `scorePool` and `pick` are exported so the
routine generator reuses them unchanged.

**`src/engine/routineGenerator.ts`** — same three steps for timed routines, with
two deliberate differences: fatigue is passed as an empty map (fried hamstrings
are a reason to stretch hamstrings, not to avoid them), and `targetMinutes` is a
real instruction — extra rotating steps are appended until the routine is long
enough.

**The history asymmetry** (documented at length in `generator.ts`, and tested):

- "when did I last do this" spans **sessions and routine logs**
- block rotation counts only activities of the **same kind**
- `muscleFatigue` reads **sessions only**

If you find yourself unifying those into one history, that is the bug, not the
fix.

**`src/storage/repository.ts`** — one localStorage key, `trainer.data.v1`, holding
the whole `AppData`. Schema is at **version 6** with a sequential migration chain.
Migrations are strictly additive: they never touch an exercise the user created,
they union new seed tags rather than replacing, and they only add ids that could
not have existed in the prior version (so a deliberately deleted seed stays
deleted). Bump `CURRENT_VERSION` and add a `MIGRATIONS[n]` entry for any schema
change.

**`src/store.tsx`** — one context holding all data, write-through to localStorage
on every mutation. Use `updateSessionWith` (not `updateSession`) whenever the new
value depends on the old one; a patch computed from a render closure loses writes
when taps land faster than React re-renders, which is exactly what happens when
ticking off sets.

## Which routine Today shows

`suggestRoutine(kind, data, now)` in `routineGenerator.ts`. Today used to render
`routines.find((r) => r.kind === 'wake')` — always the first in the array, which
with five morning and five evening routines made eight of them invisible.

Three rules, in order:

1. A routine of that kind **completed today** wins outright. You did it; the card
   says so rather than pushing a second one at you.
2. `situational` routines are excluded. A pre-swim warm-up is structurally a
   'wake' routine and would rotate to the top eventually — it is still the wrong
   thing to hand someone on a morning with no swim in it. If a kind has nothing
   but situational routines, they come back in rather than showing an empty card.
3. Otherwise, longest since you ran it. **No randomness**: `Array.sort` is stable
   so ties fall back to library order, and a card that reshuffles on every render
   is not a suggestion.

`leadRoutineKind(now)` decides which of the two cards leads, and lives in the
engine rather than the view so its boundaries are testable — an off-by-one there
shows up as the wrong card at 6am, which is when nobody is awake enough to
notice it is wrong.

## Sessions vs routines

A **session** is the gym: sets, reps, weight, progression, charts.
A **routine** is a timed flow — wake-up, wind-down, sauna — with nothing to log
and nothing to progress. They log separately (`sessions` vs `routineLogs`)
because sixty mobility flows a month would swamp the progress charts and tell the
fatigue model you trained hard while sitting and breathing.

`'mobility'` and `'stretch'` are separate movement patterns for a real reason:
active drills warm tissue and suit mornings, passive holds are calming and blunt
force output before lifting. A step asking for `['stretch']` is structurally
incapable of serving a hip airplane at 22:30.

`src/views/Flow.tsx` runs routines hands-free. It tracks time against a
**wall-clock deadline**, not interval ticks — background the tab and the
arithmetic still comes back right. It writes its log the moment the routine ends,
not when the summary is closed.

## Load types and the logger

The logger has exactly two numeric columns. `setFields()` in
`engine/progression.ts` is the single place deciding what they mean for a given
`loadType`; adding a load type is one case there, not a hunt through views.
Distance work (`distance-time`) uses `Slot.distanceRange` — repRange is never
reinterpreted as metres. Pace is derived from distance and seconds, never typed.

## Figures

`src/components/Figure.tsx` draws a schematic body from joint angles via forward
kinematics. Full-library coverage is only possible because an exercise is ~2 lines
of pose data in `src/data/figures.ts`, resolved as **pattern default plus
per-exercise override**. The figure is grounded by the **feet**, not the pelvis —
the pelvis is the root of the chain, so pinning it made squats keep their hips at
a fixed height and sink their feet through the floor.

`'swim'` and `'protocol'` get no figure on purpose. A side-on stick figure cannot
show a catch or a body roll, and a wrong picture is worse than none.

## The Instagram import

`scripts/importReels.mjs` reads Meta's data export from `../0 Exercise saved
posts/` and generates `src/data/reelSources.ts` (deterministic — same input,
byte-identical output). `src/data/reelExercises.ts` is the other half: **hand
written**, never generated, so a re-import cannot overwrite judgement.

Two traps, both already paid for once:

- The export is **double-encoded UTF-8**; everything goes through `decode()`.
- Lexicons need **word boundaries and plurals**. `\brow\b` matches *grow/throw*;
  `\bexercise\b` does not match *exercises*. The first bug inflated counts
  tenfold, the second silently dropped 35 training posts.

Captions are the only content outside the videos, and the videos cannot be read
by anything automated. Where a caption names a topic but not the movements,
**nothing is invented** — the reel goes to the watch queue (Library -> Reels)
instead. `status: 'unwatched'` on an `Exercise` is filtered out by `eligibleFor`
so a placeholder can never reach a workout; there is a test that generates 40
sessions and 40 routines to prove it.

`scripts/fetchReels.mjs` downloads reels and extracts contact sheets for review.
**The user runs it, not Claude** — it needs their browser cookies, and the sandbox
blocks reading the cookie store. Progress lives in `../0 Reel frames/` alongside
`review-ledger.json` (what has been reviewed and what came of it) and `dead.json`
(posts proven gone). Downloaded video is deleted the moment frames are extracted;
none of a creator's footage enters the repo.

## The PWA

`base` is `'./'` in `vite.config.ts` on purpose: the same `dist/` runs from a
domain root or from a `/project/` subpath, so where it gets hosted is not a
decision the build has to make.

`dist/sw.js` is **generated** by `scripts/buildSW.mjs` after `vite build`, never
hand-written — Vite content-hashes the bundle, so a hand-maintained precache list
is wrong the moment anything changes, and a worker caching half an app serves
that half forever. The cache name is a hash of the precached *content*, which
covers the un-hashed files (`index.html`, the icons, the manifest) too.

The worker only removes the network dependency on load. Everything else was
already offline. It is cache-first for the shell, passes cross-origin requests
(the Instagram links) straight through, and never caches itself.

**The trap, already paid for once:** the runtime path must never store an HTML
response under a non-HTML URL. A single-page host answers "no such file" with the
app shell and a **200** (`vite preview` does), so caching that under
`/assets/index-abc123.js` poisons the cache permanently — every later load gets
HTML where the browser wanted a module, and the app goes blank with a MIME type
error until storage is cleared by hand. The generator's own bytes are part of the
cache-name hash for the same reason: change the worker's logic and the cache name
has to move, or the new worker inherits whatever the old one put there.

`main.tsx` registers it in production only, and reloads once on
`controllerchange` so a phone cannot sit on a months-old build. Two guards there
are load-bearing: `hadController` (skip the reload on the first visit, where the
worker claims a page that is already newest) and `reloading` (never loop).

The worker does not run under `vite dev`. Verify with `npm run preview`, and test
offline properly by stopping the server and reloading.

## Places, and the one rule that keeps them simple

`Settings.availableEquipment` is **still** the engine's single source of truth.
Nothing downstream of `engine/places.ts` knows places exist: switching one writes
its kit into `availableEquipment`, and ticking a chip writes back into the
current place. One direction of truth, two ways to change it — do not add a
second resolution path.

`Place.loadCeilings` caps `suggestLoad`. At a ceiling, double progression has
nowhere to go on load so it goes on reps, and the rationale says which. This is
the whole reason places are worth having rather than being a fancier preset.

## Goals, phases and the week

`engine/goals.ts` — a date becomes weeks-to-race becomes a phase. **No date means
no countdown**: an undated goal returns `dated: false` and sits in base, because
"week 7 of 16" is meaningless when week 16 is imaginary. `weeksBetween` measures
between CALENDAR DAYS, not instants — measuring from `now` made a race 28 days
out read as 5 weeks and tapered a week late.

`engine/week.ts` — the week is **derived, never stored**. A stored week is wrong
the first time you move a session and has to be maintained by hand forever. Two
placement rules are load-bearing: gym days are spread with `spread()` rather than
sorted by distance from the long run (which clustered three of them onto
Tue/Wed/Thu), and nothing lifts the day after the long run.

Deloads need history. No logged sessions means no deload is claimed.

## Fuelling and niggles

`engine/fuelling.ts` gives population ranges and says so. Anything depending on
bodyweight requires a logged bodyweight — with none it returns the guidance
without the number rather than inventing a 75kg athlete. Same rule as never
inventing an exercise.

`engine/niggles.ts` is a blunt filter you switch on yourself, exempting `rehab`
work. There is no `knee-friendly` tag in the library, so a knee niggle removes
squats and lunges outright rather than pretending to be more precise than it is.

## The coach

`src/engine/coach.ts` runs deterministic rules over logged history and returns a
`WeeklyReview`. Progress renders it at the top.

Two rules govern anything added here:

- **Every insight carries the number it came from** (`evidence`). If a rule
  cannot point at a number, it does not fire. A test asserts this across every
  scenario, because an observation you cannot check is an opinion the app is not
  entitled to have.
- **No history means no insight.** An empty log returns `thin: true` and says so.
  Inventing something encouraging on day one is the same failure as inventing an
  exercise from a caption that never named one.

`weeklyReview(data, now)` takes an injectable clock — every rule is arithmetic on
dates, so the tests pin `now` rather than passing on the day they were written.
Thresholds are named constants with the reasoning beside them; they are meant to
be argued with.

`routineStreak` lives here too, because Today and the review both need it.

## Interface rules that are enforced, not aspirational

- **44px minimum touch target.** `index.css` has claimed this since the first
  commit and 351 elements were breaking it. If you add a control, measure it.
- **`--text-faint` is the most-read colour in the app** — it carries every
  `.reason` and `.faint` line. It is tuned to clear 4.5:1 against `--surface` in
  both themes. Do not darken it in light or dim it in dark "to be subtle".
- **Destructive actions do not live in lists.** Delete belongs on the detail page
  for the thing being deleted, not beside every row of a 330-item list.
- **Two screens must not disagree about the same day.** Today follows
  `planWeek`; if you add another surface that decides what to train, it follows
  the week too or it does not ship.

## Figures

Three files. `figureGeometry.ts` builds the skeleton in 3D and projects it by
hand — no WebGL, and no per-exercise animation data, because that would have to
be invented. `figureMuscles.ts` places the 21 muscles the rest of the app
already reasons about onto that skeleton. `Figure.tsx` draws it: solid capsules
and a trunk polygon, painter's-algorithm depth sorting, play/scrub/turn.

Three rules that are load-bearing:

- **Abduct before you flex.** Rotating a limb about the forward axis does
  nothing to an arm already held out in front.
- **Pattern is for programming, not for pictures.** Wall balls are
  `conditioning` so a heavy 4×5 slot can never serve 100 of them; they get an
  explicit squat-shaped figure so the drawing is still honest.
- **`frameFor` is memoised per spec and must stay frozen.** Recomputing bounds
  per frame makes the figure breathe as it moves and swell as you turn it.

## Content conventions

Exercises sourced from reels carry `sourceUrl`, `reelId`, and the creator's handle
in `notes`. Where a caption makes a claim that is marketing or unverified, the
note says **who claimed it** rather than asserting it. German and Polish captions
are translated with the original's point preserved in `notes`.

Tags are load-bearing, not decorative: `warmup`/`rehab`/`shoulder-health` drive
warm-up slots, `home` drives the no-gym program, and
`wake`/`wind-down`/`spine`/`hip-mobility`/`shoulder-mobility`/`ankle`/`breathing`/
`desk-relief` drive routine steps. Tag a new drill accordingly and it starts
appearing on its own.

Exercise **names must be unique** — a test enforces it. Ids are prefixed by
origin (`sq-`, `wk-`, `wd-`, `fx-`, `hm-`, `sw-`, `rn-`, `sa-`, `ig-`).

## Known gaps

Kept in `STATUS.md` so there is one place to update. Short version: the PWA is
built but nothing hosts it yet and there is still no git repo, `Equipment` has no
stability-ball, and there are 17 routines where the Today screen should suggest
one rather than list them all.

One rule that is now enforced rather than remembered: every `Equipment` member
must appear in a group in `src/data/equipment.ts`, which is the only list
Settings renders. `tsc -b` fails if you add one and forget.
