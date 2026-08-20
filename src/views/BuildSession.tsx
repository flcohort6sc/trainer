/**
 * Build a session by hand.
 *
 * The generator fills requirements; this fills nothing and asks you. Same
 * logger, same history, same progress charts at the end of it — the only
 * difference is that you chose. Useful for the day you know exactly what you
 * want, for testing something new, and for anyone who simply does not want an
 * algorithm involved.
 *
 * It still shows what the app knows about each exercise as you pick — the last
 * time you did it, and what it would have suggested for load — because that is
 * the part worth having, not the choosing.
 */

import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import { buildUsageIndex } from '../engine/generator'
import type { Exercise, Session } from '../types'

interface Picked {
  exercise: Exercise
  sets: number
  reps: number
}

export default function BuildSession({ onStarted, onCancel }: { onStarted: () => void; onCancel: () => void }) {
  const { data, startSession } = useStore()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Picked[]>([])

  const usage = useMemo(() => buildUsageIndex(data, 'session'), [data])
  const available = new Set(data.settings.availableEquipment)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.exercises
      .filter((e) => !e.archived && e.status !== 'unwatched')
      .filter((e) => picked.every((p) => p.exercise.id !== e.id))
      .filter((e) =>
        q === ''
          ? e.equipment.every((x) => available.has(x))
          : e.name.toLowerCase().includes(q) ||
            e.pattern.includes(q) ||
            e.primaryMuscles.some((m) => m.includes(q)),
      )
      .slice(0, 40)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.exercises, query, picked, data.settings.availableEquipment])

  function start() {
    const now = new Date().toISOString()
    const session: Session = {
      id: uid('sess-'),
      date: now.slice(0, 10),
      name: 'My own session',
      startedAt: now,
      entries: picked.map((p) => ({
        exerciseId: p.exercise.id,
        prescribed: { sets: p.sets, repRange: [p.reps, p.reps] },
        sets: Array.from({ length: p.sets }, () => ({ completed: false })),
      })),
    }
    startSession(session)
    onStarted()
  }

  const lastDone = (e: Exercise) => {
    const days = usage.daysSince(e.id)
    if (days === Infinity) return 'never done'
    if (days < 1) return 'done today'
    if (days < 2) return 'done yesterday'
    return `${Math.floor(days)} days ago`
  }

  return (
    <>
      <div className="card-row">
        <h2 style={{ margin: 0 }}>Build it yourself</h2>
        <button className="btn btn-sm" onClick={onCancel}>← Back</button>
      </div>
      <p className="faint">
        No generator. Pick what you want, in the order you want it. It logs and counts exactly like
        any other session.
      </p>

      {picked.length > 0 && (
        <div className="card">
          {picked.map((p, i) => (
            <div className="list-item" key={p.exercise.id}>
              <div style={{ minWidth: 0 }}>
                <div>{p.exercise.name}</div>
                <div className="faint">{p.exercise.pattern} · {lastDone(p.exercise)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="number" inputMode="numeric" min="1" value={p.sets} aria-label="Sets"
                  style={{ width: 56 }}
                  onChange={(e) => setPicked((list) => list.map((x, j) => j === i ? { ...x, sets: Math.max(1, Number(e.target.value)) } : x))}
                />
                <span className="faint">×</span>
                <input
                  type="number" inputMode="numeric" min="1" value={p.reps} aria-label="Reps"
                  style={{ width: 56 }}
                  onChange={(e) => setPicked((list) => list.map((x, j) => j === i ? { ...x, reps: Math.max(1, Number(e.target.value)) } : x))}
                />
                <button className="btn btn-sm btn-ghost" onClick={() => setPicked((l) => l.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search the library…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query.trim() === '' && (
        <p className="faint" style={{ marginTop: -6 }}>
          Showing what you can do at {data.settings.places?.find((p) => p.id === data.settings.currentPlaceId)?.name ?? 'this place'}.
          Search to see everything.
        </p>
      )}

      {matches.map((e) => (
        <div className="card clickable" key={e.id}
          onClick={() => setPicked((l) => [...l, { exercise: e, sets: 3, reps: 10 }])}>
          <div className="card-row">
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{e.name}</h3>
              <p className="faint" style={{ margin: '2px 0 0' }}>
                {e.pattern} · {e.equipment.join(', ')} · {lastDone(e)}
              </p>
            </div>
            <span className="btn btn-sm">+</span>
          </div>
        </div>
      ))}

      {picked.length > 0 && (
        <div className="sticky-actions">
          <button className="btn btn-primary btn-block" onClick={start}>
            Start {picked.length} exercise{picked.length === 1 ? '' : 's'}
          </button>
        </div>
      )}
    </>
  )
}
