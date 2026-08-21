/**
 * App state.
 *
 * One React context holding the whole database, plus helpers that mutate it.
 * Every mutation writes straight through to localStorage -- there is no "save"
 * button anywhere in this app, and there should not be. You are in a gym.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  AppData, Exercise, Session, BodyMetric, Goal, Settings, Program, Routine, RoutineLog, ReelProgress,
} from './types'
import * as repo from './storage/repository'

interface Store {
  data: AppData
  /** Escape hatch for bulk edits; prefer the named helpers below. */
  update: (fn: (draft: AppData) => AppData) => void

  addExercise: (e: Exercise) => void
  updateExercise: (id: string, patch: Partial<Exercise>) => void
  deleteExercise: (id: string) => void

  startSession: (s: Session) => void
  updateSession: (id: string, patch: Partial<Session>) => void
  /**
   * Update a session from its own latest state. Use this whenever the new value
   * depends on the old one -- `updateSession` with a patch computed from a
   * render closure loses writes when taps land faster than React re-renders,
   * which is exactly what happens when you tick off four sets in a row.
   */
  updateSessionWith: (id: string, fn: (s: Session) => Session) => void
  finishSession: (id: string) => void
  deleteSession: (id: string) => void
  activeSession: Session | undefined

  /**
   * Routines are short enough that there is no "in progress" state to persist:
   * the flow player holds its own state and writes one log when you stop.
   * A half-finished session is worth recovering; a half-finished 7-minute
   * stretch is worth forgetting.
   */
  logRoutine: (l: RoutineLog) => void
  updateRoutineLog: (id: string, patch: Partial<RoutineLog>) => void
  deleteRoutineLog: (id: string) => void
  saveRoutine: (r: Routine) => void
  deleteRoutine: (id: string) => void

  /**
   * Watch-queue progress. Kept separate from the generated reel list so
   * re-importing a fresh export never wipes out which reels you have worked
   * through.
   */
  setReelStatus: (reelId: string, status: ReelProgress['status'], note?: string) => void

  addMetric: (m: BodyMetric) => void
  deleteMetric: (id: string) => void

  saveProgram: (p: Program) => void
  deleteProgram: (id: string) => void

  /** A race, or anything else with a date attached. */
  saveGoal: (g: Goal) => void
  deleteGoal: (id: string) => void

  updateSettings: (patch: Partial<Settings>) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => repo.load())

  // Write through on every change. Cheap at this data size.
  useEffect(() => {
    repo.save(data)
  }, [data])

  const update: Store['update'] = (fn) => setData((prev) => fn(prev))

  const store: Store = {
    data,
    update,

    addExercise: (e) => update((d) => ({ ...d, exercises: [...d.exercises, e] })),
    // Editing an exercise makes its wording yours; the load-time reconcile
    // will leave it alone from now on.
    updateExercise: (id, patch) =>
      update((d) => ({
        ...d,
        exercises: d.exercises.map((e) => (e.id === id ? { ...e, ...patch, userEdited: true } : e)),
      })),
    // Archive rather than delete when there is history -- deleting would orphan
    // every logged set that references this exercise.
    deleteExercise: (id) =>
      update((d) => {
        const hasHistory = d.sessions.some((s) => s.entries.some((e) => e.exerciseId === id))
        return hasHistory
          ? { ...d, exercises: d.exercises.map((e) => (e.id === id ? { ...e, archived: true } : e)) }
          : { ...d, exercises: d.exercises.filter((e) => e.id !== id) }
      }),

    startSession: (s) => update((d) => ({ ...d, sessions: [...d.sessions, s] })),
    updateSession: (id, patch) =>
      update((d) => ({
        ...d,
        sessions: d.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),
    updateSessionWith: (id, fn) =>
      update((d) => ({
        ...d,
        sessions: d.sessions.map((s) => (s.id === id ? fn(s) : s)),
      })),
    finishSession: (id) =>
      update((d) => ({
        ...d,
        sessions: d.sessions.map((s) =>
          s.id === id ? { ...s, finishedAt: new Date().toISOString() } : s,
        ),
      })),
    deleteSession: (id) => update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
    activeSession: data.sessions.find((s) => !s.finishedAt),

    logRoutine: (l) => update((d) => ({ ...d, routineLogs: [...d.routineLogs, l] })),
    updateRoutineLog: (id, patch) =>
      update((d) => ({
        ...d,
        routineLogs: d.routineLogs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      })),
    deleteRoutineLog: (id) =>
      update((d) => ({ ...d, routineLogs: d.routineLogs.filter((l) => l.id !== id) })),

    saveRoutine: (r) =>
      update((d) => ({
        ...d,
        routines: d.routines.some((x) => x.id === r.id)
          ? d.routines.map((x) => (x.id === r.id ? r : x))
          : [...d.routines, r],
      })),
    deleteRoutine: (id) => update((d) => ({ ...d, routines: d.routines.filter((r) => r.id !== id) })),

    setReelStatus: (reelId, status, note) =>
      update((d) => {
        const entry: ReelProgress = { reelId, status, updatedAt: new Date().toISOString(), note }
        return {
          ...d,
          reelProgress: d.reelProgress.some((r) => r.reelId === reelId)
            ? d.reelProgress.map((r) => (r.reelId === reelId ? entry : r))
            : [...d.reelProgress, entry],
        }
      }),

    addMetric: (m) =>
      update((d) => ({
        ...d,
        metrics: [...d.metrics, m].sort((a, b) => a.date.localeCompare(b.date)),
      })),
    deleteMetric: (id) => update((d) => ({ ...d, metrics: d.metrics.filter((m) => m.id !== id) })),

    saveProgram: (p) =>
      update((d) => ({
        ...d,
        programs: d.programs.some((x) => x.id === p.id)
          ? d.programs.map((x) => (x.id === p.id ? p : x))
          : [...d.programs, p],
      })),
    deleteProgram: (id) => update((d) => ({ ...d, programs: d.programs.filter((p) => p.id !== id) })),

    saveGoal: (g) =>
      update((d) => ({
        ...d,
        goals: (d.goals ?? []).some((x) => x.id === g.id)
          ? d.goals.map((x) => (x.id === g.id ? g : x))
          : [...(d.goals ?? []), g],
      })),
    deleteGoal: (id) => update((d) => ({ ...d, goals: (d.goals ?? []).filter((g) => g.id !== id) })),

    updateSettings: (patch) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
