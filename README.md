# Trainer

A personal, offline-first training app. Generates adaptive gym sessions and
short timed routines from your own exercise library, logs them, and tracks
progress. No server, no account, no network — your data lives in your browser
and nowhere else.

```bash
npm run dev     # http://localhost:5173
npm test        # engine verification (no browser needed)
npm run build   # production bundle in dist/
```

---

## The one idea worth understanding

**A program stores requirements, not exercises.**

A normal workout app stores "Monday: Back Squat 4×5". This one stores a *slot*:

```ts
{
  label: 'Lower push (heavy)',
  role: 'primary',
  patterns: ['squat'],        // any squat-pattern exercise can fill this
  sets: 4, repRange: [5, 8],
  restSeconds: 180,
  rotation: 'rotate',
}
```

At the moment you tap **Generate**, the engine finds every exercise in your
library that could fill that slot — right movement pattern, equipment you
actually have today, within your difficulty cap — scores them, and picks one.

That indirection is what makes everything else possible:

- Change your available equipment and today's session re-plans around it.
- Add an exercise from a video and it immediately becomes eligible everywhere
  its pattern fits. You never edit a program to introduce it.
- The same program day gives you a different session in week 5 than week 1.

## How a session gets built

`src/engine/generator.ts`, three steps per slot:

**1. Filter** — who is eligible at all?
Pattern match → equipment you have → difficulty cap → required muscles →
required tags → not already used in this session.

**2. Score** — how good is each candidate *right now*? Five competing terms:

| Term | Rewards | Why it exists |
|---|---|---|
| Freshness | not done recently | the actual variety |
| Familiarity | lifts you have a history with | you can't add 2.5kg to a lift you never repeat |
| Recovery | muscles that aren't fried | stops squats the day after squats |
| Block penalty | *punishes* 4+ recent uses | forces the rotation that familiarity would otherwise prevent |
| Load penalty | *punishes* unloadable exercises in heavy slots | a bodyweight squat is a bad "4×5 heavy" |

Freshness and familiarity pull in opposite directions on purpose. The balance
is set by `varietyBias` (your Settings slider) scaled by the slot's `role` —
primaries rotate slowly so you can progress them, accessories rotate freely
because nothing is lost by swapping a curl variation.

**3. Pick** — weighted-random among the top candidates, with ties broken
randomly. Taking the single best score every time makes an "adaptive" program
perfectly predictable, and freezes each slot on whatever sits first in your
library.

Every choice carries a `reason` string that is shown in the UI. If the app gives
you something odd, it tells you why it thought that.

## Routines are not sessions

A **session** is the gym: sets, reps, weight, progression, charts. A **routine**
is the morning floor and the ten minutes before bed: a timed flow of holds with
nothing to log and nothing to progress.

They share the generator — a `RoutineStep` stores a requirement ("60 seconds of
passive hip work") exactly like a `Slot` does, so `eligibleFor` and `scorePool`
work on both unchanged. `targetMinutes` is a real instruction: the engine keeps
adding rotating steps until the routine is roughly that long.

Three things are deliberately different (`src/engine/routineGenerator.ts`):

- **Fatigue is ignored.** Fried hamstrings are a reason to stretch hamstrings,
  not to avoid them, so the recovery term is flattened.
- **They log separately** (`routineLogs`, not `sessions`). Sixty mobility flows
  a month would swamp every progress chart and tell the fatigue model you
  trained hard when you sat and breathed.
- **But recency still crosses over.** `buildUsageIndex` in `generator.ts` folds
  both sources for "when did I last do this", while block rotation counts only
  activities of the same kind and fatigue reads sessions alone. That asymmetry
  is load-bearing — there is a comment on it, and a test.

`'mobility'` and `'stretch'` are separate movement patterns for the same reason:
a wake-up wants active drills, a wind-down wants passive holds, and long passive
holds before lifting measurably blunt force output. A routine step asking for
`['stretch']` is structurally incapable of handing you a hip airplane at 22:30.

## What Today puts in front of you

Seventeen routines is a library, not a decision. Listing them is the Routines
tab's job; **Today picks one** — the routine of the right kind you have gone
longest without — and tells you why on the card:

```
🌙 EVENING
Pre-Sleep Mobility
8 min · 1 of 4
longest since you ran it — 9 days ago
```

The clock decides which card leads: mornings until 14:00, wind-down after. The
other stays visible but small, because knowing the evening exists is useful and
being nudged towards it at 07:00 is not. Do one and it flips to a tick rather
than offering you a second.

Some routines are marked `situational` — the pre-run, pre-swim and post-swim
warm-ups. They are structurally morning and evening routines and would come
round in the rotation eventually, which would mean being handed a pre-swim
warm-up on a day with no swim in it. They stay in the Routines tab, to be picked
on purpose.

## The flow player

`src/views/Flow.tsx` runs a routine hands-free: big countdown, auto-advance,
side-switch prompt on unilateral drills, a distinct tone for "switch sides", and
`navigator.wakeLock` so the screen does not sleep mid-hold. It tracks time
against a wall-clock deadline rather than counting interval ticks — background
the tab and the arithmetic simply comes back correct.

The log is written the moment the routine ends, not when you close the summary.
Walking away from the "how do you feel?" screen must not lose the session.

## Swimming, running and sauna

Endurance work runs through the **same slot machinery** as the weights, because a
swim session genuinely is sets, reps and rest — "8 × 50m on 20s". The only real
difference is the unit, so a slot carries an optional `distanceRange` and the
logger asks for metres and seconds instead of kilos and reps. **Pace is derived,
never typed.**

Reinterpreting `repRange` as metres would have been cheaper and a lie:
`repsToSeconds` is a genuine conversion, "50 reps means 50 metres" is not.

`setFields()` in `progression.ts` is the single place that decides what the
logger's two numeric columns mean for a given `loadType`. Adding a load type is
one case there, not a hunt through the views.

Sauna and cold exposure carry the `'protocol'` pattern — not movement at all,
which is what keeps a sauna round out of a squat slot. They are still a timed
sequence, so the flow player runs them unchanged. Rounds are allowed to repeat
via `allowRepeat` on the step; round three is supposed to be the same sauna as
round one, and every other routine still refuses to repeat an exercise.

`open-water`, `paddles` and `track` ship switched **off**. Open water is a safety
decision rather than a kit list, paddles magnify a bad catch into a shoulder
problem, and most people have no track. All three are one tick away under
Settings → **Swimming** / **Running**, which is the point of shipping them off
rather than leaving them out.

Settings groups equipment as Gym, Swimming, Running and Recovery, and the gym
presets ("Full gym", "Travel / hotel") only touch the gym block — a hotel might
still have a pool. `src/data/equipment.ts` is the single list behind all of it,
and the build refuses to compile if a new piece of equipment has no home there.

## Guides

`src/data/lessons.ts`, surfaced under Library → **Guides**. Twelve written
pieces, weighted toward swimming: session structure, freestyle technique,
breathing, what each drill is for, the CSS pace test, open water, plus running,
sauna and the training principles this app is built on.

They are not part of `AppData` — they ship with the build, so they cost nothing
to edit and never need a migration.

## The Instagram import

`scripts/importReels.mjs` reads Meta's official "Download your information"
export and emits `src/data/reelSources.ts`. Deterministic — same input, byte
identical output — so re-running it after a fresh export is safe.

From 1,516 saved posts it keeps **285** that read as training. Of those:

| What the caption supports | Count | Becomes |
|---|---|---|
| Names the movements | 67 | Real exercises, hand-authored |
| Sets and reps, no movement names | 49 | Watch queue |
| Explanation only | 10 | Guide material (mostly false positives) |
| A topic and nothing else | 170 | Watch queue |

**The captions are the only content that exists outside the videos.** The reel
page is a JavaScript shell behind a login wall — no Open Graph tags, no video
URL — and nothing here can watch a video. So a post saying "4 exercises for
stiff hips" without naming them produces *nothing*. It goes in the watch queue
and waits for you. Guessing what those four movements were would poison the
library with plausible fiction, which is worse than an obvious gap.

Two traps for whoever touches the importer next, both documented in its header:

- The export is **double-encoded UTF-8**. Every apostrophe arrives as mojibake
  until it goes through `decode()`.
- The movement lexicon **must** keep its word boundaries. Without them `row`
  matches *grow/throw/narrow* and the "names real movements" count inflates
  roughly tenfold — which silently turns the whole import into fiction.
- **Plurals need `s?` everywhere.** The first version used bare `\bexercise\b`,
  which does not match "exercises" — the boundary fails against the plural.
  That silently dropped 35 genuine training posts, ten of which named
  movements. Any word added to these lexicons needs its plural.
- Conversely, `clean` and `row` are ordinary English words. Bare, they matched
  "spotlessly clean" and "500 rows" in a spreadsheet post, so both now require
  gym context (`power clean`, `barbell row`, or a following rep count).

Captions are stored as a **400-character excerpt** with a link back, not in
full. They are someone else's writing, and an app that publishes them wholesale
is republishing rather than referencing — the excerpt is what the watch queue
needs anyway. Re-run `npm run import:reels` to regenerate.

A keyword filter also keeps things it should not: one stray training word was
enough to qualify a K-pop fashion post or an explainer on how GPT-3 is
*pre-trained*. There is a veto list for that now, and Library → Reels lets you
skip anything it still gets wrong.

`src/data/reelExercises.ts` is the other half: **146** exercises written by hand —
from the captions that named something, plus everything the reviewed contact
sheets actually showed. Cues carry what the creator actually
said, German is translated with the original kept in `notes`, and every entry
links back through `sourceUrl` and `reelId`. Some of these captions are
marketing and a few are simply wrong — the app records **who claimed what** and
leaves the judgement to you.

### Getting at what is only in the video

229 reels name a topic and never the movements. `scripts/fetchReels.mjs`
downloads those, extracts six evenly spaced frames into one contact sheet per
reel, and deletes the video immediately. Claude reads the sheets and writes the
exercises from what is actually shown.

```bash
npm run fetch:reels -- --dry-run                      # see the queue first
npm run fetch:reels -- --limit 40 --min-priority 40   # then fetch
```

**You have to run it, not Claude.** It needs your logged-in Instagram session
via `yt-dlp --cookies-from-browser`, and Claude's sandbox blocks reading the
browser cookie store. That guard is correct and worth keeping — an agent that
can read your session cookies on its own initiative is a worse trade than
typing one command yourself.

Downloading from Instagram is against their Terms of Service. Videos are
deleted the moment their frames are extracted, output lives in a sibling folder
that never enters the repo, and nothing of a creator's footage ships — only
descriptions written from what was seen, with attribution and a link back.

Reels are ordered by a **priority score**: curated-collection membership, a
stated movement count, an instructional shape, and topics you actually train,
minus engagement bait and nutrition posts. Of the 229 pending, 48 score 40 or
above and 127 score under 20. Watching the top 48 is a plan; watching all 229
is not.

### The watch queue

Library → **Reels**. Pending reels with creator, topics, claimed movement count
and caption. Open one and the reel plays beside a form that **adds and resets**,
because a single reel usually holds three or four movements.

An exercise can carry `status: 'unwatched'`. `eligibleFor` filters those out
alongside archived ones, so a placeholder can never be served in a workout.
There is a test that generates 40 sessions and 40 routines to prove it.

## Figures

Every exercise where a body position is the point gets a diagram: **307 of 330**.
The other 23 are swimming and sauna protocols, which get none on purpose — a
side-on stick figure cannot show a catch or a body roll, and a wrong picture is
worse than no picture.

Full coverage is only possible because the figures are **parametric**.
`src/components/Figure.tsx` runs forward kinematics from joint angles, so an
exercise is ~2 lines of pose data rather than a hand-drawn SVG. `figures.ts`
supplies a default per movement pattern — legitimate, because shared shape is
the premise of the whole generator — plus 67 hand-tuned overrides where the
default would be bland or wrong.

The figure is **grounded by the feet, not the pelvis**. The pelvis is the root
of the kinematic chain, so pinning it made squats keep their hips at a fixed
height and sink their feet through the floor. Grounding the lowest foot means
the hips visibly drop, which is what a squat looks like.

It shows where the limbs go, the direction of travel, and the one fault worth
marking. It is not anatomy and will never tell you what a muscle should feel
like.

## Where you are training

Home, Gym, Pool, Outdoors — each with its own kit, switched in one tap from
Settings. The generator only ever offers what is in the room you are standing in.

Home also has a **ceiling**: two 8kg kettlebells. When a lift reaches it the app
stops suggesting more weight and starts asking for reps, and says why —

> *8kg is the heaviest you have here — chase reps or slow the lowering instead*

which is what you would do anyway, and is the honest way to progress a fixed bell.

## The week

**Plan → Week.** Seven days, built from your weekly shape (gym days, run days,
swim days, where the long run goes), the phase your goal puts you in, and what
you have already logged. It is derived every time, never stored, so it cannot go
stale — and every day says why it is there.

Two placement rules worth knowing: gym days are **spread** rather than clustered,
and nothing lifts the day after the long run.

## Goals, and what a date buys you

**Plan → Goals.** A goal without a date gets base training and an honest label.
Add a date and the weeks start counting:

| Weeks out | Phase |
|---|---|
| 12+ | base |
| 5–12 | build |
| 3–4 | peak |
| 1–3 | taper (3 weeks for a marathon, 1 for a Hyrox) |
| 0 | race week |

Marathon and Hyrox bend the week differently on purpose. A marathon build drops
lifting towards maintenance so the long runs stay fresh; a Hyrox build keeps
three gym days, because strength is half the race, and turns the easy runs into
**compromised running** — the event is running on legs that are already wrecked.

Two races inside ten weeks of each other produces a warning naming both, because
training properly for both is not a thing that can be done.

⚠️ **Cycling is not modelled at all.** Swim and run are planned properly; the
triathlon goal says plainly that the bike third is not something this app can
plan for you.

## Food

Six guides under Library → Guides, and fuelling attached to the sessions that
need it. Under an hour it shows nothing, because advice you do not need is noise.
Over it, carbs per hour with before / during / after, and what the number rests
on.

Everything here is a population range and says so. Anything that depends on your
bodyweight needs a bodyweight you logged — with none, you get the formula rather
than an invented number.

## The weekly review

`src/engine/coach.ts`, shown at the top of **Progress**. Rules, not predictions:

| It says | Because |
|---|---|
| "No hinge in 12 days." | your last hinge was 12 days ago, and it names which one |
| "Back Squat has not beaten its best in 3 sessions." | the estimated 1RM of the last three, against your best before them |
| "You are doing 5.0× more pushing than pulling." | 20 pushing sets against 4 pulling, over 28 days |
| "Your routine streak stopped at 4 days." | the run that ended, and when |
| "Your last three sessions felt worse than the three before them." | 2.0/5 against 4.3/5, from your own ratings |

Every line carries the number underneath it, because an observation you cannot
check is just an opinion the app has no standing to hold. Nothing here is
predicted, generated or sent anywhere.

It only ever fires for patterns you have actually trained — never doing overhead
work is a choice, not a lapse — and with an empty log it says **"nothing logged
yet"** rather than inventing something encouraging.

## Progression

`src/engine/progression.ts` — **double progression**. Stay at a weight until you
hit the *top* of the rep range on *every* set, then add weight and drop to the
bottom of the range. Miss the bottom of the range and it backs you off.

It's the least fiddly scheme that still works, and unlike percentage-based plans
it survives you missing three weeks.

## Layout

```
src/
  types.ts                  the data model — start here
  store.tsx                 React context over the whole database
  storage/repository.ts     load/save/export/import. The ONLY file touching localStorage
  engine/
    generator.ts            slot filling: filter → score → pick
    routineGenerator.ts     the same, for timed routines
    progression.ts          load suggestions, e1RM, volume
  data/
    seedExercises.ts        ~80 starter exercises
    seedPrograms.ts         3 starter programs, written as slots
    equipment.ts            what Settings can offer, grouped
  components/LineChart.tsx  dependency-free inline-SVG chart
  components/Figure.tsx     parametric exercise diagrams
scripts/importReels.mjs     the Instagram export parser
scripts/buildSW.mjs         generates dist/sw.js after the bundle is hashed
  views/                    one file per tab, plus Flow.tsx (the player)
engine-test.ts              run with `npm test`
```

## Adding an exercise from a video

Library → **+ Add**. The fields that matter to the engine:

- **Movement pattern** — decides which slots it can fill. Get this right and
  everything else follows.
- **Primary muscles** — used for fatigue balancing.
- **Equipment** — *all* of it is required for the exercise to be offered.
- **Tags** — free-form, but a good few are load-bearing. `warmup` / `rehab` /
  `shoulder-health` drive the warmup slots; `home` drives the no-gym program;
  `wake` / `wind-down` / `spine` / `hip-mobility` / `shoulder-mobility` /
  `ankle` / `breathing` / `desk-relief` drive the routine steps. Tag a new drill
  with those and it starts appearing in your mornings on its own.

**Form cues** and **source URL** don't affect selection — they're what you
actually want back when the exercise comes up six weeks later and you've
forgotten how it went.

## On your phone

It installs. Build it, host the `dist/` folder anywhere static, open it in Safari
and use Share → **Add to Home Screen**; on Android, the browser offers to install
it. You get an icon, no browser chrome, and it opens with no network — a service
worker caches the shell, and the data was never on a server to begin with.

`base` is `'./'`, so the same build works from a domain root or a `/project/`
subpath without being rebuilt for the destination.

Two things it honestly cannot do:

- **No alarms.** A web app cannot fire a reliable scheduled local notification.
  There will be no reminder at 22:30. The streak on Today is the nudge that
  exists; an iOS Shortcuts automation that opens the app on a timer is the
  nearest real workaround, and you set that up, not the app.
- **Each install is its own database.** Phone and laptop do not sync — there is
  no server to sync through. Export from one, import into the other; import
  replaces everything, which is exactly what device transfer needs.

## Your data

One JSON object under the localStorage key `trainer.data.v1`. Schema version 6 —
`repository.ts` migrates older data on load, additively and in sequence: it never
touches an exercise you created, it unions new seed tags rather than replacing
yours, and it only ever adds ids that could not have existed in the previous
version — so a program you deliberately deleted stays deleted.

⚠️ **`\b` does not work against every script.** `\b맛집\b` can never match,
because CJK characters are not `\w` — a veto written that way silently does
nothing. Anything non-Latin needs its own pattern.

⚠️ **Browsers evict local storage.** Clearing site data, or the OS reclaiming
space, deletes your training history permanently. Settings → **Export backup**
writes a JSON file. That file is the only copy that survives. Do it occasionally.

Import replaces everything, so it doubles as device-to-device transfer.

## Notes

- `deleteExercise` archives instead of deleting when logged history references
  it — a hard delete would orphan every set you ever did.
- Mutations that depend on previous state go through `updateSessionWith`, not
  `updateSession`. Tapping four "set done" buttons faster than React re-renders
  is normal in a gym, and closure-based updates silently drop all but the last.
- `repository.ts` has a `MIGRATIONS` hook. Change the schema, bump
  `CURRENT_VERSION`, add a migration — don't silently invalidate saved data.
