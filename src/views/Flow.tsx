/**
 * The flow player.
 *
 * A routine you have to tap through is a routine you stop doing. This runs
 * hands-free: big timer, auto-advance, audible and haptic cues, and a screen
 * that will not sleep while you are lying on the floor breathing.
 *
 * Time is tracked against a wall-clock deadline rather than by counting
 * interval ticks. Background a tab and the interval throttles to once a
 * second or worse -- deadline arithmetic simply comes back correct.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import type { Routine } from '../types'
import type { GeneratedDrill, RoutineResult } from '../engine/routineGenerator'
import { toRoutineLog } from '../engine/routineGenerator'
import Figure from '../components/Figure'
import { figureFor } from '../data/figures'

type Segment =
  | { kind: 'ready'; seconds: number; drillIndex: number }
  | { kind: 'work'; seconds: number; drillIndex: number; side?: 1 | 2 }

/** Flatten drills into the exact sequence the timer walks. */
function buildSegments(drills: GeneratedDrill[]): Segment[] {
  const segments: Segment[] = []
  drills.forEach((drill, drillIndex) => {
    const lead = drill.step.transitionSeconds
    if (lead > 0) segments.push({ kind: 'ready', seconds: lead, drillIndex })

    if (drill.perSide) {
      // `seconds` was already doubled for a per-side drill, so each side gets half.
      const each = Math.round(drill.seconds / 2)
      segments.push({ kind: 'work', seconds: each, drillIndex, side: 1 })
      segments.push({ kind: 'work', seconds: each, drillIndex, side: 2 })
    } else {
      segments.push({ kind: 'work', seconds: drill.seconds, drillIndex })
    }
  })
  return segments
}

/** A short sine blip. Cheaper and more reliable than shipping an audio file. */
function useBeeper() {
  const ctxRef = useRef<AudioContext | null>(null)

  return useCallback((frequency: number, ms = 120) => {
    try {
      // Created on the first user gesture, which is what browsers require.
      ctxRef.current ??= new AudioContext()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') void ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = frequency
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + ms / 1000)
    } catch {
      // Audio is a nicety. Never let it break the workout.
    }
  }, [])
}

/** Keep the screen awake, and re-acquire it after the tab comes back. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {
        // Unsupported or denied -- the routine still works, the screen just dims.
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelled) void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}

export default function Flow({
  routine, result, onExit,
}: {
  routine: Routine
  result: RoutineResult
  onExit: () => void
}) {
  const { logRoutine, updateRoutineLog } = useStore()
  const beep = useBeeper()

  const segments = useMemo(() => buildSegments(result.drills), [result.drills])

  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(segments[0]?.seconds ?? 0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const [skipped, setSkipped] = useState<Set<number>>(new Set())
  const [feel, setFeel] = useState<1 | 2 | 3 | 4 | 5 | undefined>()
  // The log is written the moment the routine ends, not when you close the
  // summary -- walking away from the "how do you feel?" screen must not lose
  // the session. The rating is patched on afterwards if you give one.
  const [logId, setLogId] = useState<string | undefined>()

  useWakeLock(!done && !paused)

  const segment = segments[index]
  const drill = segment ? result.drills[segment.drillIndex] : undefined

  const finish = useCallback(
    (skippedNow: Set<number> = skipped) => {
      const log = toRoutineLog(routine, result)
      logRoutine({
        ...log,
        completedExerciseIds: result.drills
          .filter((_, i) => !skippedNow.has(i))
          .map((d) => d.exercise.id),
        finishedAt: new Date().toISOString(),
      })
      setLogId(log.id)
      setDone(true)
    },
    [logRoutine, routine, result, skipped],
  )

  function rate(value: 1 | 2 | 3 | 4 | 5) {
    setFeel(value)
    if (logId) updateRoutineLog(logId, { feel: value })
  }

  const advance = useCallback(() => {
    setIndex((i) => {
      const next = i + 1
      if (next >= segments.length) return i
      setRemaining(segments[next].seconds)
      return next
    })
  }, [segments])

  // The clock. A deadline, not a tick count.
  useEffect(() => {
    if (paused || done || !segment) return

    const deadline = Date.now() + remaining * 1000
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setRemaining(left)

      if (left === 0) {
        clearInterval(id)
        const isLast = index === segments.length - 1
        if (isLast) {
          beep(880, 320)
          navigator.vibrate?.([120, 60, 120])
          finish()
        } else {
          const upcoming = segments[index + 1]
          // A distinct tone for "switch sides" so you do not have to look.
          beep(upcoming.kind === 'work' && upcoming.side === 2 ? 990 : 660)
          navigator.vibrate?.(upcoming.kind === 'work' ? 180 : 80)
          advance()
        }
      }
    }, 200)

    return () => clearInterval(id)
    // `remaining` is intentionally excluded: it is recomputed from the deadline
    // inside the interval, and including it would restart the clock every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, done, segment, advance, beep, finish, segments])

  function skipDrill() {
    if (!segment) return
    const drillIndex = segment.drillIndex
    setSkipped((prev) => new Set(prev).add(drillIndex))

    const nextIndex = segments.findIndex((s, i) => i > index && s.drillIndex !== drillIndex)
    if (nextIndex === -1) {
      finish(new Set(skipped).add(drillIndex))
      return
    }
    setIndex(nextIndex)
    setRemaining(segments[nextIndex].seconds)
  }

  function back() {
    if (!segment) return
    const drillIndex = segment.drillIndex
    const prevIndex = segments.findIndex((s) => s.drillIndex === drillIndex - 1)
    const target = prevIndex === -1 ? 0 : prevIndex
    setIndex(target)
    setRemaining(segments[target].seconds)
  }

  function addTime(seconds: number) {
    setRemaining((r) => r + seconds)
  }

  if (done) {
    const completed = result.drills.length - skipped.size
    return (
      <div className="flow flow-done">
        <div className="flow-body">
          <p className="flow-kicker">{routine.name}</p>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Done.</h1>
          <p className="dim">
            {completed} of {result.drills.length} drills ·{' '}
            {Math.round(result.totalSeconds / 60)} min
          </p>

          <p className="faint" style={{ marginTop: 28, marginBottom: 8 }}>How do you feel?</p>
          <div className="feel-row">
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <button
                key={v}
                className={`btn feel-btn${feel === v ? ' is-on' : ''}`}
                onClick={() => rate(v)}
              >
                {['😖', '😐', '🙂', '😀', '🤩'][v - 1]}
              </button>
            ))}
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 28 }} onClick={onExit}>
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!segment || !drill) return null

  const isReady = segment.kind === 'ready'
  // "Next" means the next DRILL, not the next segment. A get-ready segment and
  // the two sides of a per-side drill all belong to the drill already on screen,
  // so naming any of them "next" would just show you what you are looking at.
  const nextSegment = segments.find((s, i) => i > index && s.drillIndex !== segment.drillIndex)
  const nextDrill = nextSegment ? result.drills[nextSegment.drillIndex] : undefined
  const progress = segment.seconds > 0 ? 1 - remaining / segment.seconds : 1

  const R = 84
  const CIRCUMFERENCE = 2 * Math.PI * R

  return (
    <div className={`flow${isReady ? ' is-ready' : ''}`}>
      <div className="flow-top">
        <button className="btn btn-sm" onClick={onExit}>✕ Stop</button>
        <span className="faint">
          Drill {segment.drillIndex + 1} / {result.drills.length}
        </span>
      </div>

      <div className="flow-body">
        <p className="flow-kicker">{isReady ? 'Get ready' : drill.step.label}</p>

        {/* During a get-ready segment `drill` is already the drill you are about
            to do -- that is what makes the transition useful. */}
        <h1 className="flow-name">{drill.exercise.name}</h1>

        {/* The get-ready window is exactly when a picture is useful: you are
            reading it, not holding a position. During work the timer wins. */}
        {isReady && figureFor(drill.exercise) && (
          <Figure
            spec={figureFor(drill.exercise)!}
            title={drill.exercise.name}
            size={120}
            primaryMuscles={drill.exercise.primaryMuscles}
            secondaryMuscles={drill.exercise.secondaryMuscles}
          />
        )}

        {segment.kind === 'work' && segment.side && (
          <p className="flow-side">{segment.side === 1 ? 'First side' : '↻ Switch sides'}</p>
        )}

        <div className={`flow-ring${isReady ? ' is-ready' : ''}`}>
          <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
            <circle cx="100" cy="100" r={R} className="ring-track" />
            <circle
              cx="100" cy="100" r={R}
              className={`ring-fill${isReady ? ' is-ready' : ''}`}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            />
          </svg>
          {/* Seconds up to a minute, m:ss beyond it -- counting down from 600
              on a sauna round is unreadable at a glance. */}
          <div className="flow-count" role="timer" aria-live="off">
            {remaining >= 60
              ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
              : remaining}
          </div>
        </div>

        {drill.exercise.cues[0] && <p className="flow-cue">{drill.exercise.cues[0]}</p>}

        {drill.exercise.sourceUrl && !isReady && (
          <p style={{ margin: '4px 0 0' }}>
            <a href={drill.exercise.sourceUrl} target="_blank" rel="noreferrer" className="faint">
              Watch the video ↗
            </a>
          </p>
        )}
      </div>

      <div className="flow-controls">
        <div className="flow-row">
          <button className="btn" onClick={back} aria-label="Previous drill">⏮</button>
          <button className="btn btn-primary flow-play" onClick={() => setPaused((p) => !p)}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="btn" onClick={skipDrill} aria-label="Skip this drill">⏭</button>
        </div>
        <div className="flow-row">
          <button className="btn btn-sm" onClick={() => addTime(15)}>+15s</button>
          <button className="btn btn-sm" onClick={() => finish()}>Finish early</button>
        </div>
        {nextDrill ? (
          <p className="faint flow-next">Next: {nextDrill.exercise.name}</p>
        ) : (
          <p className="faint flow-next">Last one</p>
        )}
      </div>
    </div>
  )
}
