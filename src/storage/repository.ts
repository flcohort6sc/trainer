/**
 * Persistence.
 *
 * Everything goes through this module. The rest of the app never touches
 * localStorage directly -- so when the data outgrows localStorage (photos,
 * years of history) we rewrite this one file to use IndexedDB and nothing
 * else changes. That is the whole point of a repository layer.
 */

import type { AppData, Equipment, Place, Settings } from '../types'
import { HYROX_EXERCISES } from '../data/hyroxExercises'
import { SEED_ENDURANCE } from '../data/seedEndurance'
import { SEED_EXERCISES } from '../data/seedExercises'
import { SEED_MOBILITY } from '../data/seedMobility'
import { SEED_PROGRAMS } from '../data/seedPrograms'
import { REEL_SOURCES } from '../data/reelSources'
import { REEL_EXERCISES } from '../data/reelExercises'
import { SEED_ROUTINES } from '../data/seedRoutines'
import { SEED_SAUNA } from '../data/seedSauna'

const STORAGE_KEY = 'trainer.data.v1'
const CURRENT_VERSION = 8

/** Everything that ships in the box. */
const ALL_SEED_EXERCISES = [
  ...SEED_EXERCISES, ...SEED_MOBILITY, ...SEED_ENDURANCE, ...SEED_SAUNA,
  ...REEL_EXERCISES, ...HYROX_EXERCISES,
]

/**
 * Where you train, and what is actually there.
 *
 * `Settings.availableEquipment` is still the engine's single source of truth --
 * it holds whichever place is currently selected. These are the saved kits you
 * switch between, so moving from the living room to the gym is one tap rather
 * than sixteen.
 */
const GYM_KIT: Equipment[] = [
  'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
  'pullup-bar', 'bands', 'bench', 'box', 'mat', 'ab-wheel', 'medicine-ball',
  'sauna', 'cold-plunge',
]

const DEFAULT_PLACES: Place[] = [
  {
    id: 'place-home',
    name: 'Home',
    icon: '🏠',
    equipment: ['bodyweight', 'mat', 'foam-roller', 'pushup-bars', 'kettlebell'],
    // Two 8kg bells. Past this the app stops suggesting more weight and starts
    // asking for more reps, because there is no more weight in the room.
    loadCeilings: { kettlebell: 8 },
  },
  {
    id: 'place-gym',
    name: 'Gym',
    icon: '🏋️',
    equipment: GYM_KIT,
  },
  {
    id: 'place-pool',
    name: 'Pool',
    icon: '🏊',
    equipment: ['bodyweight', 'mat', 'pool', 'kickboard', 'pull-buoy', 'fins', 'sauna'],
  },
  {
    id: 'place-outdoors',
    name: 'Outdoors',
    icon: '🌤',
    equipment: ['bodyweight', 'outdoors'],
  },
]

const DEFAULT_SETTINGS: Settings = {
  units: 'kg',
  // Starts at the gym because it is the richest kit -- a fresh install can
  // generate anything. Switching to Home or Pool narrows it honestly.
  availableEquipment: GYM_KIT,
  places: DEFAULT_PLACES,
  currentPlaceId: 'place-gym',
/*
  Deliberately NOT on by default anywhere: 'open-water', 'paddles', 'track', and
  the four Hyrox stations. Open water is a real safety decision rather than a kit
  list, paddles magnify a bad catch into a shoulder problem, most people have no
  track, and claiming a rower you do not have makes a Hyrox plan lie to you.
*/
  varietyBias: 0.6,
  rotationWindowDays: 21,
  maxDifficulty: 3,
  weeklyShape: {
    gymDays: 3,
    runDays: 3,
    swimDays: 1,
    saunaDays: 1,
    // Sunday. Long runs want a day with nothing after them.
    longRunWeekday: 0,
    deloadEveryWeeks: 4,
  },
  niggles: [],
}

function freshData(): AppData {
  return {
    version: CURRENT_VERSION,
    exercises: ALL_SEED_EXERCISES,
    programs: SEED_PROGRAMS,
    routines: SEED_ROUTINES,
    reels: REEL_SOURCES,
    reelProgress: [],
    sessions: [],
    routineLogs: [],
    metrics: [],
    // No invented races. A goal exists when you enter one.
    goals: [],
    settings: DEFAULT_SETTINGS,
  }
}

/**
 * Migrations run in order when loading data written by an older version.
 * Every one of these is additive on purpose: your logged history and anything
 * you created yourself must survive untouched.
 */
const MIGRATIONS: Record<number, (d: AppData) => AppData> = {
  /** v1 -> v2: routines, and the mobility library they need to be any good. */
  1: (d) => {
    const seedById = new Map(SEED_EXERCISES.map((e) => [e.id, e]))
    const present = new Set(d.exercises.map((e) => e.id))

    // Existing seed exercises gained tags in v2 ('home', 'no-equipment') so the
    // routines can select them. Union only -- never drop a tag you added.
    const patched = d.exercises.map((e) => {
      const seed = seedById.get(e.id)
      if (!seed) return e
      const tags = [...new Set([...e.tags, ...seed.tags])]
      return tags.length === e.tags.length ? e : { ...e, tags }
    })

    // Only the mobility set is back-filled. Re-adding v1 seeds would resurrect
    // exercises you deliberately deleted; nothing in SEED_MOBILITY existed in
    // v1, so there is no deletion to second-guess.
    const added = SEED_MOBILITY.filter((e) => !present.has(e.id))

    return {
      ...d,
      exercises: [...patched, ...added],
      routines: d.routines?.length ? d.routines : SEED_ROUTINES,
      routineLogs: d.routineLogs ?? [],
    }
  },

  /** v2 -> v3: swimming, running, sauna. */
  2: (d) => {
    const haveExercise = new Set(d.exercises.map((e) => e.id))
    const havePrograms = new Set(d.programs.map((p) => p.id))
    const haveRoutines = new Set(d.routines.map((r) => r.id))

    // Same rule as v2: only add ids that could not possibly have been deleted,
    // because they did not exist in the previous version.
    const newExercises = [...SEED_ENDURANCE, ...SEED_SAUNA].filter((e) => !haveExercise.has(e.id))
    const newPrograms = SEED_PROGRAMS.filter(
      (p) => (p.id === 'prog-swim' || p.id === 'prog-run') && !havePrograms.has(p.id),
    )
    const newRoutines = SEED_ROUTINES.filter(
      (r) => r.kind === 'sauna' && !haveRoutines.has(r.id),
    )

    // Without the new equipment ticked, every swim and sauna would be filtered
    // out on arrival and the whole addition would look broken.
    const equipment = new Set(d.settings.availableEquipment)
    for (const q of ['pool', 'kickboard', 'pull-buoy', 'fins', 'outdoors', 'treadmill', 'sauna', 'cold-plunge'] as const) {
      equipment.add(q)
    }

    return {
      ...d,
      exercises: [...d.exercises, ...newExercises],
      programs: [...d.programs, ...newPrograms],
      routines: [...d.routines, ...newRoutines],
      settings: { ...d.settings, availableEquipment: [...equipment] },
    }
  },

  /** v3 -> v4: the Instagram import. */
  3: (d) => {
    const have = new Set(d.exercises.map((e) => e.id))
    return {
      ...d,
      // Everything that existed before the import is, by definition, watched.
      exercises: [
        ...d.exercises
          // v2 shipped two copies of World's Greatest Stretch. The seed file is
          // fixed, but installs from v2/v3 still hold both. Archive rather than
          // delete: archiving is reversible and cannot orphan logged history.
          .map((e) => (e.id === 'wk-worlds-greatest' ? { ...e, archived: true } : e))
          .map((e) => (e.status ? e : { ...e, status: 'ready' as const })),
        ...REEL_EXERCISES.filter((e) => !have.has(e.id)),
      ],
      // Re-importable: the generated source list is replaced wholesale, while
      // reelProgress (which reels you have worked through) is yours and is
      // only ever created, never overwritten.
      reels: REEL_SOURCES,
      reelProgress: d.reelProgress ?? [],
    }
  },

  /**
   * v4 -> v5: routines learn that some of them are situational.
   *
   * Today now rotates through your daily routines instead of always showing
   * the first one in the list, which made the pre-swim and pre-run warm-ups
   * eligible to be suggested on a morning with no swim or run in it. Patching
   * three known seed ids rather than replacing the routines: anything you
   * wrote yourself is left alone and defaults to suggestible, which is the
   * right guess for a routine someone made on purpose.
   */
  4: (d) => ({
    ...d,
    routines: d.routines.map((r) =>
      ['rt-prerun', 'rt-preswim', 'rt-postswim'].includes(r.id) && r.situational === undefined
        ? { ...r, situational: true }
        : r,
    ),
  }),

  /**
   * v5 -> v6: places, goals, a weekly shape, niggles, and the kit that was
   * missing (foam roller, push-up bars, the Hyrox stations).
   *
   * Your existing equipment selection becomes the Gym place, so nothing about
   * what the generator offers changes on upgrade -- you simply gain three more
   * places to switch to. Guessing which of your ticked items lived in which
   * room would be a worse answer than keeping them together.
   */
  5: (d) => ({
    ...d,
    goals: d.goals ?? [],
    settings: {
      ...d.settings,
      places: d.settings.places?.length
        ? d.settings.places
        : DEFAULT_PLACES.map((p) =>
            p.id === 'place-gym' ? { ...p, equipment: [...d.settings.availableEquipment] } : p,
          ),
      currentPlaceId: d.settings.currentPlaceId ?? 'place-gym',
      weeklyShape: d.settings.weeklyShape ?? DEFAULT_SETTINGS.weeklyShape,
      niggles: d.settings.niggles ?? [],
    },
  }),

  /**
   * v6 -> v7: the Hyrox stations, their honest substitutes, and enough
   * squatting, lunging, carrying and pulling to stop those patterns being thin.
   *
   * Additive, and only ids that could not have existed before — so anything you
   * deleted stays deleted.
   */
  6: (d) => {
    const have = new Set(d.exercises.map((e) => e.id))
    return { ...d, exercises: [...d.exercises, ...HYROX_EXERCISES.filter((e) => !have.has(e.id))] }
  },

  /**
   * v7 -> v8: refresh the written instructions on exercises that shipped with
   * the app.
   *
   * Every other migration here is additive because your data is yours. Cues are
   * the exception, and the reason is a bug this rule created: the whole library
   * lives in localStorage, so rewriting a cue in the seed files reached new
   * installs only. An existing phone kept the old wording for ever, and the
   * work of improving 353 sets of instructions would never have arrived.
   *
   * So this one overwrites, but only for ids the app itself shipped -- anything
   * you created has an `ex-` id from `uid()` and is never touched. If you edited
   * the cues on one of ours, this replaces them; that is the trade, and it is
   * the right way round, because the alternative is that nobody ever gets a
   * correction.
   */
  7: (d) => {
    const shipped = new Map(ALL_SEED_EXERCISES.map((e) => [e.id, e]))
    return {
      ...d,
      exercises: d.exercises.map((e) => {
        const seed = shipped.get(e.id)
        if (!seed) return e
        return { ...e, cues: seed.cues, notes: seed.notes ?? e.notes }
      }),
    }
  },
}

/**
 * Bring the app's own written content up to date, every load.
 *
 * The library lives in localStorage, so a rewritten cue reached new installs
 * only. A one-off migration fixed that once and then stranded the next
 * improvement, because the schema was already past it — so this runs every
 * time instead.
 *
 * It only ever touches ids the app shipped, and never an exercise you have
 * edited. Your logged history, your own exercises, and anything you reworded
 * are all untouched: this is the difference between the app's copy and your
 * data.
 */
export function refreshShippedContent(data: AppData): AppData {
  const shipped = new Map(ALL_SEED_EXERCISES.map((e) => [e.id, e]))
  let changed = 0

  const exercises = data.exercises.map((e) => {
    const seed = shipped.get(e.id)
    if (!seed || e.userEdited) return e
    const sameCues = e.cues.length === seed.cues.length && e.cues.every((c, i) => c === seed.cues[i])
    if (sameCues && e.notes === seed.notes) return e
    changed++
    return { ...e, cues: seed.cues, notes: seed.notes ?? e.notes }
  })

  return changed === 0 ? data : { ...data, exercises }
}

export function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshData()

    let data = JSON.parse(raw) as AppData

    while (data.version < CURRENT_VERSION) {
      const migrate = MIGRATIONS[data.version]
      if (!migrate) break
      data = migrate(data)
      data.version += 1
    }

    // Defensive: merge in any settings keys added since this data was saved.
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings }
    data.goals = data.goals ?? []
    return refreshShippedContent(data)
  } catch (err) {
    console.error('Could not read saved data, starting fresh:', err)
    return freshData()
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    // Most likely QuotaExceededError. The user needs to know immediately --
    // silently failing here means losing a workout they think they logged.
    console.error('Save failed:', err)
    alert(
      'Could not save your data — browser storage may be full.\n\n' +
        'Export a backup from Settings before doing anything else.',
    )
  }
}

/** Download the whole database as a JSON file. This is your backup. */
export function exportToFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trainer-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Read a backup file back in. Throws with a readable message if it is not ours. */
export async function importFromFile(file: File): Promise<AppData> {
  const text = await file.text()
  const parsed = JSON.parse(text) as AppData

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('That file does not contain trainer data.')
  }
  for (const key of ['exercises', 'programs', 'sessions', 'metrics'] as const) {
    if (!Array.isArray(parsed[key])) {
      throw new Error(`Backup is missing "${key}" — it may be from a different app.`)
    }
  }

  // A backup from an older version is still a valid backup. Fill in what is
  // missing and let the normal migration chain handle the rest on next load.
  //
  // MISSING and EMPTY mean different things here. `routines: undefined` is a
  // backup written before routines existed, so it gets the seeds. `routines: []`
  // is someone who deleted all of theirs, and refilling would resurrect what
  // they threw away -- the same rule the migrations follow. `reels` is the
  // opposite case: it is a generated catalogue rather than your content, so an
  // empty one is always refilled.
  parsed.routines = parsed.routines ?? SEED_ROUTINES
  parsed.routineLogs = parsed.routineLogs ?? []
  parsed.reels = parsed.reels?.length ? parsed.reels : REEL_SOURCES
  parsed.reelProgress = parsed.reelProgress ?? []
  parsed.goals = parsed.goals ?? []
  parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings }
  return parsed
}

export function resetToSeed(): AppData {
  return freshData()
}

/** Short unique id. Not cryptographic -- just needs to not collide locally. */
export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
