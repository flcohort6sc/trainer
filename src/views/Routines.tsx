/**
 * Routines: pick one, see what today's version looks like, run it.
 *
 * The preview matters. A generated routine you cannot inspect before starting
 * is a black box you will stop trusting the first time it hands you pigeon
 * pose on a day your hip hurts.
 */

import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { generateRoutine, rerollDrill, type RoutineResult } from '../engine/routineGenerator'
import type { RoutineKind } from '../types'
import Flow from './Flow'

const KIND_LABEL: Record<RoutineKind, string> = {
  wake: 'Morning',
  'wind-down': 'Evening',
  flexibility: 'Flexibility',
  recovery: 'Recovery',
  sauna: 'Sauna',
}

const KIND_ICON: Record<RoutineKind, string> = {
  wake: '🌅',
  'wind-down': '🌙',
  flexibility: '🧘',
  recovery: '💆',
  sauna: '🔥',
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')}`
}

/**
 * A 45-second stretch reads fine as "45s". A 600-second sauna round does not --
 * nobody thinks in ten-hundreds of seconds.
 */
function fmtStep(seconds: number, perSide: boolean): string {
  const each = perSide ? Math.round(seconds / 2) : seconds
  const text = each >= 90 ? fmtDuration(each) : `${each}s`
  return perSide ? `${text} per side` : text
}

export default function Routines({ initialRoutineId }: { initialRoutineId?: string }) {
  const { data } = useStore()
  const [selectedId, setSelectedId] = useState<string | undefined>(initialRoutineId)
  const [plan, setPlan] = useState<RoutineResult | null>(null)
  const [running, setRunning] = useState(false)

  const routine = data.routines.find((r) => r.id === selectedId)

  // Arriving from a Today card should land on a ready-to-run plan, not a menu.
  useEffect(() => {
    if (initialRoutineId) setSelectedId(initialRoutineId)
  }, [initialRoutineId])

  useEffect(() => {
    if (routine) setPlan(generateRoutine(routine, data))
    else setPlan(null)
    // Regenerating on every store change would reshuffle the list under your
    // thumb; this deliberately only reacts to which routine is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const lastDone = useMemo(() => {
    const map = new Map<string, string>()
    for (const log of data.routineLogs) {
      const prev = map.get(log.routineId)
      if (!prev || log.startedAt > prev) map.set(log.routineId, log.startedAt)
    }
    return map
  }, [data.routineLogs])

  function reroll(i: number) {
    if (!plan || !routine) return
    const drill = plan.drills[i]
    const others = plan.drills.filter((_, j) => j !== i).map((d) => d.exercise.id)
    const next = rerollDrill(drill.step, data, others, drill.exercise.id)
    if (!next) {
      alert('Nothing else in your library fits this step yet.')
      return
    }
    const drills = [...plan.drills]
    drills[i] = next
    setPlan({
      ...plan,
      drills,
      totalSeconds: drills.reduce((sum, d) => sum + d.seconds + d.step.transitionSeconds, 0),
    })
  }

  if (running && routine && plan) {
    return <Flow routine={routine} result={plan} onExit={() => { setRunning(false); setPlan(generateRoutine(routine, data)) }} />
  }

  if (!routine) {
    return (
      <>
        <h1>Routines</h1>
        <p className="subtitle">
          Short, timed, hands-free. Nothing to log, nothing to progress — just press start.
        </p>

        {data.routines.filter((r) => !r.archived).map((r) => {
          const last = lastDone.get(r.id)
          return (
            <button key={r.id} className="card card-button" onClick={() => setSelectedId(r.id)}>
              <div className="card-row">
                <div style={{ minWidth: 0 }}>
                  <p className="faint" style={{ margin: 0 }}>
                    {KIND_ICON[r.kind]} {KIND_LABEL[r.kind]} · {r.targetMinutes} min
                  </p>
                  <h3 style={{ margin: '2px 0' }}>{r.name}</h3>
                  <p className="faint" style={{ margin: 0 }}>
                    {last
                      ? `last done ${new Date(last).toLocaleDateString()}`
                      : 'never done'}
                  </p>
                </div>
                <span className="dim" style={{ fontSize: 20 }}>›</span>
              </div>
              <p className="dim" style={{ fontSize: 13, margin: '8px 0 0' }}>{r.description}</p>
            </button>
          )
        })}
      </>
    )
  }

  return (
    <>
      <button className="btn btn-sm" onClick={() => setSelectedId(undefined)}>‹ All routines</button>

      <h1 style={{ marginTop: 12 }}>{routine.name}</h1>
      <p className="subtitle">{routine.description}</p>

      {plan && (
        <>
          <div className="card-row" style={{ margin: '16px 0 8px' }}>
            <strong>{fmtDuration(plan.totalSeconds)}</strong>
            <button className="btn btn-sm" onClick={() => setPlan(generateRoutine(routine, data))}>
              🎲 Regenerate
            </button>
          </div>

          {plan.unfilled.length > 0 && (
            <div className="banner banner-warn">
              <strong>{plan.unfilled.length} step{plan.unfilled.length > 1 ? 's' : ''} could not be filled:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {plan.unfilled.map((u) => (
                  <li key={u.step.id}>{u.step.label} — {u.reason}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.drills.map((d, i) => (
            <div className="card" key={`${d.step.id}-${i}`}>
              <div className="card-row">
                <div style={{ minWidth: 0 }}>
                  <p className="faint" style={{ margin: 0 }}>{d.step.label}</p>
                  <h3 style={{ margin: '2px 0' }}>{d.exercise.name}</h3>
                  <p className="mono dim" style={{ margin: 0, fontSize: 14 }}>
                    {fmtStep(d.seconds, d.perSide)}
                  </p>
                  <p className="reason">{d.reason}</p>
                </div>
                <button className="btn btn-sm" onClick={() => reroll(i)} title="Pick a different drill">🎲</button>
              </div>
            </div>
          ))}

          <div className="sticky-actions">
            <button
              className="btn btn-primary btn-block"
              onClick={() => setRunning(true)}
              disabled={plan.drills.length === 0}
            >
              ▶ Start — {fmtDuration(plan.totalSeconds)}
            </button>
          </div>
        </>
      )}
    </>
  )
}
