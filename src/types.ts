/**
 * The data model.
 *
 * The important idea lives in `Slot`: a program does not store exercises,
 * it stores *requirements*. "Give me a knee-dominant push, 3x5-8, heavy."
 * The generator fills that requirement at runtime from whatever is in your
 * library and whatever equipment you have today. That is what makes the
 * plans adaptive instead of a fixed list you get bored of.
 */

/**
 * Movement patterns are the backbone of exercise selection.
 * Two exercises with the same pattern are interchangeable for programming
 * purposes -- a front squat and a Bulgarian split squat both train the
 * "knee bends under load" job, so either can fill a squat slot.
 */
export type MovementPattern =
  | 'squat'              // knee-dominant, bilateral
  | 'lunge'              // knee-dominant, unilateral
  | 'hinge'              // hip-dominant (deadlift, RDL, swing)
  | 'push-horizontal'    // bench, push-up
  | 'push-vertical'      // overhead press
  | 'pull-horizontal'    // row
  | 'pull-vertical'      // pull-up, lat pulldown
  | 'carry'              // loaded carries
  | 'core-anti-extension'   // plank, ab wheel
  | 'core-anti-rotation'    // pallof press
  | 'core-flexion'          // hanging leg raise
  | 'isolation'          // curls, raises, extensions
  | 'conditioning'       // intervals, sled, bike
  | 'swim'               // pool and open water
  | 'run'                // road, trail, treadmill
  | 'protocol'           // not movement at all -- sauna rounds, cold exposure
  | 'mobility'           // active drills taken through a range of motion
  | 'stretch'            // passive holds and breathwork -- see the note below

/**
 * Why 'mobility' and 'stretch' are different patterns.
 *
 * A wake-up routine wants ACTIVE drills -- you move through a range under your
 * own control, which raises tissue temperature and switches things on. A
 * wind-down wants PASSIVE holds, where you settle into a position and breathe.
 * They are not interchangeable: long passive holds before training measurably
 * blunt force output, and an active drill does nothing to help you fall asleep.
 *
 * Tags could express this, but then the generator could not act on it -- a
 * routine step says `patterns: ['stretch']` and is structurally incapable of
 * serving you a hip airplane at 22:30.
 */
export type Muscle =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'adductors' | 'abductors'
  | 'chest' | 'lats' | 'upper-back' | 'traps' | 'lower-back'
  | 'front-delts' | 'side-delts' | 'rear-delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'hip-flexors' | 'neck'

export type Equipment =
  | 'bodyweight' | 'barbell' | 'dumbbell' | 'kettlebell' | 'machine'
  | 'cable' | 'pullup-bar' | 'bands' | 'bench' | 'rings' | 'box'
  | 'medicine-ball' | 'sled' | 'trx' | 'ab-wheel' | 'mat'
  // Endurance and recovery. Same rule as everything else: ALL of an exercise's
  // equipment must be available for it to be offered, so unticking 'pool' in
  // Settings removes every swim from every plan.
  | 'pool' | 'open-water' | 'kickboard' | 'pull-buoy' | 'fins' | 'paddles'
  | 'outdoors' | 'treadmill' | 'track'
  | 'sauna' | 'cold-plunge'
  // Floor kit that is not a mat. A foam roller ("black roll") is its own thing:
  // rolling drills need one and cannot be faked, and push-up bars change the
  // wrist position enough that some pressing is only possible with them.
  | 'foam-roller' | 'pushup-bars'
  // Hyrox stations. These exist so a plan can say plainly whether it is
  // training a station or approximating it -- see PLACES in repository.ts.
  | 'rower' | 'ski-erg' | 'sandbag' | 'wall-ball'

/**
 * How a set of this exercise is measured. Drives which input fields the
 * logger shows -- a plank asks for seconds, a squat asks for weight x reps.
 */
export type LoadType =
  | 'weight-reps'   // squat: 100kg x 5
  | 'reps'          // push-up: 20
  | 'time'          // plank: 60s
  | 'weight-time'   // farmer carry: 2x24kg for 40s
  | 'distance'      // sled push: 20m -- distance is the whole prescription
  | 'distance-time' // swim/run: 100m in 1:35. Both are logged, pace is derived

export interface Exercise {
  id: string
  name: string
  pattern: MovementPattern
  primaryMuscles: Muscle[]
  secondaryMuscles: Muscle[]
  /** ALL of these must be available for the exercise to be selectable. */
  equipment: Equipment[]
  unilateral: boolean
  /** 1 = anyone can do it, 2 = needs some base, 3 = advanced/skill-heavy */
  difficulty: 1 | 2 | 3
  loadType: LoadType
  /** Form cues -- this is where the good stuff from a reel ends up. */
  cues: string[]
  /** The reel this came from, if any. Links back to a ReelSource. */
  reelId?: string
  /**
   * 'unwatched' means: imported from a reel whose caption named a topic but
   * never the movements, so this is a placeholder waiting for you to watch the
   * video and fill it in. The generator refuses to serve these -- see
   * `eligibleFor`. Absent means ready, so every pre-existing exercise stays
   * eligible without a migration touching it.
   */
  status?: 'ready' | 'unwatched'
  /** Link back to the reel / video it came from. */
  sourceUrl?: string
  notes?: string
  /** Free-form: 'warmup', 'finisher', 'knee-friendly', 'travel'... */
  tags: string[]
  createdAt: string
  archived?: boolean
}

export type SlotRole = 'warmup' | 'primary' | 'secondary' | 'accessory' | 'finisher'

/**
 * How much the generator is allowed to vary this slot.
 * - fixed:  always the pinned exercise (for lifts you want to progress linearly)
 * - rotate: prefer whatever you have done least recently (max variety, no repeats)
 * - random: weighted random from the eligible pool (surprise me)
 */
export type Rotation = 'fixed' | 'rotate' | 'random'

export interface Slot {
  id: string
  /** Human label shown before an exercise is picked: "Main lower push" */
  label: string
  role: SlotRole
  /** Eligible patterns -- an exercise matching ANY of these can fill the slot. */
  patterns: MovementPattern[]
  /** Optional narrowing: the exercise must train at least one of these. */
  requireMuscles?: Muscle[]
  /**
   * Optional narrowing: the exercise must carry at least one of these tags.
   * This is how a "warmup" slot avoids offering you a bicep curl -- pattern
   * alone is too coarse, because a curl and a band pull-apart are both
   * 'isolation' but only one of them is a sensible warmup.
   */
  requireTags?: string[]
  /** Optional narrowing: never pick exercises needing this kit for this slot. */
  excludeEquipment?: Equipment[]
  /** Cap on difficulty for this slot. */
  maxDifficulty?: 1 | 2 | 3

  // --- prescription ---
  sets: number
  repRange: [number, number]
  /**
   * Used instead of repRange when the chosen exercise is measured in distance.
   * A swim slot is "8 x 50m", and there is no honest way to express that as a
   * rep count -- repsToSeconds converts, but "50 reps means 50 metres" would
   * just be a lie the whole app then has to remember.
   */
  distanceRange?: [number, number]
  /** Rate of perceived exertion target, 6-10. Optional. */
  rpe?: number
  restSeconds: number

  // --- variety ---
  rotation: Rotation
  /** Used when rotation === 'fixed'. */
  pinnedExerciseId?: string
}

export interface DayTemplate {
  id: string
  name: string
  /** Short description of the day's intent: "heavy lower, low volume". */
  focus?: string
  slots: Slot[]
}

export interface Program {
  id: string
  name: string
  description?: string
  days: DayTemplate[]
  createdAt: string
  archived?: boolean
}

// --- logging ---

export interface SetLog {
  weight?: number
  reps?: number
  seconds?: number
  distance?: number
  rpe?: number
  completed: boolean
}

export interface LoggedExercise {
  exerciseId: string
  /** Which slot this filled, so we can learn what the generator picked. */
  slotId?: string
  /** What the generator suggested, kept for comparison against what you did. */
  prescribed?: { sets: number; repRange: [number, number]; weight?: number; distance?: number }
  sets: SetLog[]
  note?: string
}

export interface Session {
  id: string
  /** ISO date (YYYY-MM-DD) for grouping; startedAt has the full timestamp. */
  date: string
  programId?: string
  dayTemplateId?: string
  name: string
  entries: LoggedExercise[]
  startedAt: string
  finishedAt?: string
  notes?: string
  /** How the session felt overall, 1-5. Feeds future adaptation. */
  rating?: 1 | 2 | 3 | 4 | 5
}

// --- routines ---

/**
 * A routine is a short, timed, non-progressive flow: wake up, wind down,
 * stretch on the living room floor. It is deliberately NOT a Session.
 *
 * Sessions carry weight, reps and progression history. Sixty mobility flows a
 * month logged as Sessions would swamp every progress chart and tell the
 * fatigue model you trained your hamstrings hard when you sat and breathed.
 * So routines log separately -- see RoutineLog -- and only feed back into the
 * generator's *recency* tracking, never its fatigue tracking.
 */
export type RoutineKind = 'wake' | 'wind-down' | 'flexibility' | 'recovery' | 'sauna'

/**
 * The Slot analogue for routines: a requirement, not a drill. Same idea that
 * makes programs adaptive -- "60 seconds of hip mobility" is filled at run
 * time, so tomorrow morning is not identical to this morning.
 */
export interface RoutineStep {
  id: string
  /** Shown while the exercise is being chosen: 'Spine', 'Hips', 'Breathing'. */
  label: string
  patterns: MovementPattern[]
  requireTags?: string[]
  requireMuscles?: Muscle[]
  /** Hold / work duration for this step. */
  seconds: number
  /** Unilateral exercises run this step twice, once per side. */
  perSide?: boolean
  /**
   * Normally a routine never repeats an exercise. Sauna rounds are the
   * exception: round three is supposed to be the same sauna as round one.
   */
  allowRepeat?: boolean
  /** Setup time before the next drill starts. */
  transitionSeconds: number
  rotation: Rotation
  pinnedExerciseId?: string
}

export interface Routine {
  id: string
  name: string
  kind: RoutineKind
  description?: string
  /**
   * Run this when the situation calls for it, not as today's routine.
   *
   * A pre-swim warm-up is a 'wake' routine in every structural sense -- active
   * drills, short, done before something else -- but suggesting it at 07:00 on
   * a day with no swim is a bad suggestion. Today rotates through your daily
   * routines and leaves these to be chosen deliberately from the Routines tab.
   */
  situational?: boolean
  /**
   * The engine keeps adding rotating extra steps until the routine is roughly
   * this long, so "give me 12 minutes" is a real request rather than a label.
   */
  targetMinutes: number
  steps: RoutineStep[]
  createdAt: string
  archived?: boolean
}

/** Much lighter than a Session: what you did, what you skipped, how it felt. */
export interface RoutineLog {
  id: string
  date: string
  routineId: string
  /** Every exercise the generator served, in order. */
  exerciseIds: string[]
  /** The subset you actually completed rather than skipped. */
  completedExerciseIds: string[]
  startedAt: string
  finishedAt?: string
  feel?: 1 | 2 | 3 | 4 | 5
}

// --- body metrics ---

export interface BodyMetric {
  id: string
  date: string
  weight?: number
  bodyFatPct?: number
  /** Free-form circumferences: { chest: 102, waist: 84, ... } in cm/in. */
  measurements?: Record<string, number>
  note?: string
}


// --- imported reels ---

/**
 * One saved Instagram post.
 *
 * The caption is the only content that exists outside the video, and the
 * videos cannot be read by anything automated -- the page is a JavaScript
 * shell behind a login wall with no Open Graph tags. So `extraction` records
 * how much this post can honestly give us:
 *
 *   named         the caption names real movements -> a real exercise exists
 *   protocol-only sets and reps but no movement names -> the video knows
 *   educational   explains something -> guide material
 *   topic-only    a topic and nothing else
 *
 * Everything except 'named' lands in the watch queue rather than being
 * guessed at.
 */
export interface ReelSource {
  id: string
  url: string
  shortcode: string
  /** Instagram handle of whoever posted it. Used for attribution. */
  creator?: string
  creatorName?: string
  savedAt: string
  /** The saved-collection this was filed under, when it was in one. */
  collection?: string
  caption: string
  language: 'en' | 'de' | 'pl' | 'other'
  extraction: 'named' | 'protocol-only' | 'educational' | 'topic-only'
  topics: string[]
  /** Movement words the caption actually contains. */
  movementsNamed?: string[]
  /** How many movements the caption claims to show ("4 exercises"). */
  claimedCount?: number
  /** Crude worth-watching score. Orders the watch queue so the good ones surface. */
  priority?: number
  hashtags?: string[]
}

/** Where a reel has got to in the watch queue. Kept out of ReelSource so the
 *  generated file stays pure data and your progress is never overwritten by a
 *  re-import. */
export interface ReelProgress {
  reelId: string
  status: 'pending' | 'processed' | 'skipped'
  updatedAt: string
  note?: string
}

// --- settings ---

/**
 * A place you train, with the kit that is actually there.
 *
 * Equipment used to be one flat list, which is wrong for anyone who trains in
 * more than one location: your living room has a mat and two 8kg bells, the gym
 * has a rack. Switching used to mean re-ticking sixteen chips.
 */
export interface Place {
  id: string
  name: string
  /** One emoji. Shown on the switcher, where a word would not fit. */
  icon?: string
  equipment: Equipment[]
  /**
   * The heaviest you can go here, per implement, in your units.
   *
   * This is what stops the app suggesting 12kg in a room whose heaviest object
   * is an 8kg kettlebell. At a ceiling, progression switches from adding weight
   * to adding reps -- which is the honest way to progress a fixed bell.
   */
  loadCeilings?: Partial<Record<Equipment, number>>
}

/**
 * Something you are training FOR.
 *
 * `date` is optional and that is the whole point: without one there is no
 * countdown, no periodisation and no taper, and the app says so rather than
 * inventing a sixteen-week plan for a race that does not exist yet.
 */
export type GoalKind = 'hyrox' | 'marathon' | 'half-marathon' | 'triathlon' | 'general'

export interface Goal {
  id: string
  kind: GoalKind
  name: string
  /** ISO date (YYYY-MM-DD) of the event. Absent = base training, honestly labelled. */
  date?: string
  notes?: string
  createdAt: string
  archived?: boolean
}

/**
 * The shape of a normal week for you, in days.
 *
 * The planner treats these as intentions rather than commandments -- a taper
 * week cuts them, a deload week cuts them further -- but they are the thing you
 * set once and the plan is built around.
 */
export interface WeeklyShape {
  gymDays: number
  runDays: number
  swimDays: number
  saunaDays: number
  /** 0 = Sunday, 1 = Monday... Where the long run goes. */
  longRunWeekday: number
  /** Every Nth week is an easier one. 0 turns deloads off. */
  deloadEveryWeeks: number
}

/**
 * Something that hurts right now.
 *
 * Not a diagnosis and not medical advice -- a filter. Ticking 'knee' stops the
 * generator handing you deep knee flexion this week and prefers the drills
 * already tagged knee-friendly. It is meant to be turned off again.
 */
export type Niggle = 'knee' | 'lower-back' | 'shoulder' | 'hip' | 'ankle' | 'wrist' | 'neck'

export interface Settings {
  units: 'kg' | 'lb'
  /**
   * What you can reach RIGHT NOW: the current place's kit, flattened.
   *
   * Still the engine's single source of truth, so nothing downstream has to
   * know places exist. Switching a place writes this; editing the chips while a
   * place is active writes back to that place.
   */
  availableEquipment: Equipment[]
  /** Everywhere you train. */
  places: Place[]
  currentPlaceId?: string
  /** 0 = always give me the same exercises, 1 = maximum variety. */
  varietyBias: number
  /**
   * Take the best-scoring exercise for every slot instead of choosing at
   * random from the top few.
   *
   * The weighted-random pick is what stops an "adaptive" program being
   * perfectly predictable — but predictable is exactly what some people want,
   * and being handed something you did not choose is the most common reason to
   * stop trusting a generator. With this on, Generate is a pure function of
   * your history: same inputs, same session, every time.
   */
  pickBest?: boolean
  /** Days before an exercise is considered "fresh" again. */
  rotationWindowDays: number
  maxDifficulty: 1 | 2 | 3
  weeklyShape: WeeklyShape
  /** Which program the week planner books your gym days from. */
  activeProgramId?: string
  /**
   * The welcome screen has been dealt with. Absent means a fresh install, which
   * is exactly when it should appear.
   */
  onboarded?: boolean
  /** Empty most of the time. See Niggle. */
  niggles: Niggle[]
}

/** The whole database. One object, one localStorage key, trivially exportable. */
export interface AppData {
  version: number
  exercises: Exercise[]
  programs: Program[]
  routines: Routine[]
  reels: ReelSource[]
  reelProgress: ReelProgress[]
  sessions: Session[]
  routineLogs: RoutineLog[]
  metrics: BodyMetric[]
  goals: Goal[]
  settings: Settings
}
