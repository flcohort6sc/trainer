import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import {
  sessionVolume, sessionDistance, repsToSeconds, setFields, formatDistance, formatPace, paceUnit,
} from '../engine/progression'
import type { SetLog, Exercise, Session } from '../types'

export default function Log({ goToToday }: { goToToday: () => void }) {
  const { data, activeSession, updateSession, updateSessionWith, finishSession, deleteSession } = useStore()
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)

  if (!activeSession) {
    return (
      <>
        <h1>Log</h1>
        <div className="empty">
          <div className="big">🏋️</div>
          <p>No session in progress.</p>
          <button className="btn btn-primary" onClick={goToToday}>Generate a workout</button>
        </div>
        {data.sessions.length > 0 && <RecentSessions sessions={data.sessions} exercises={data.exercises} />}
      </>
    )
  }

  const session = activeSession
  const byId = new Map(data.exercises.map((e) => [e.id, e]))

  // Every one of these derives the new value from the session's LATEST state
  // rather than the copy captured at render time. Tapping four "done" buttons
  // in a row is normal use, and closure-based updates silently drop all but one.
  function patchSet(entryIdx: number, setIdx: number, patch: Partial<SetLog>) {
    updateSessionWith(session.id, (s) => ({
      ...s,
      entries: s.entries.map((entry, i) =>
        i !== entryIdx
          ? entry
          : { ...entry, sets: entry.sets.map((x, j) => (j === setIdx ? { ...x, ...patch } : x)) },
      ),
    }))
  }

  function toggleSet(entryIdx: number, setIdx: number) {
    let nowComplete = false
    updateSessionWith(session.id, (s) => {
      nowComplete = !s.entries[entryIdx].sets[setIdx].completed
      return {
        ...s,
        entries: s.entries.map((entry, i) =>
          i !== entryIdx
            ? entry
            : {
                ...entry,
                sets: entry.sets.map((x, j) => (j === setIdx ? { ...x, completed: !x.completed } : x)),
              },
        ),
      }
    })

    // Completing a set starts the rest clock for that exercise's slot.
    if (nowComplete) {
      const slotId = session.entries[entryIdx].slotId
      const program = data.programs.find((p) => p.id === session.programId)
      const day = program?.days.find((d) => d.id === session.dayTemplateId)
      const rest = day?.slots.find((s) => s.id === slotId)?.restSeconds ?? 0
      if (rest > 0) setRestEndsAt(Date.now() + rest * 1000)
    }
  }

  function addSet(entryIdx: number) {
    updateSessionWith(session.id, (s) => ({
      ...s,
      entries: s.entries.map((entry, i) => {
        if (i !== entryIdx) return entry
        const last = entry.sets[entry.sets.length - 1]
        return { ...entry, sets: [...entry.sets, { ...last, completed: false }] }
      }),
    }))
  }

  function removeSet(entryIdx: number) {
    updateSessionWith(session.id, (s) => ({
      ...s,
      entries: s.entries.map((entry, i) =>
        i === entryIdx && entry.sets.length > 1
          ? { ...entry, sets: entry.sets.slice(0, -1) }
          : entry,
      ),
    }))
  }

  function finish() {
    const done = session.entries.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)
    if (done === 0) {
      if (!confirm('You have not completed any sets. Discard this session?')) return
      deleteSession(session.id)
      goToToday()
      return
    }
    finishSession(session.id)
    goToToday()
  }

  const completedSets = session.entries.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)
  const totalSets = session.entries.reduce((n, e) => n + e.sets.length, 0)

  return (
    <>
      <div className="card-row">
        <div>
          <h1 style={{ marginBottom: 0 }}>{session.name}</h1>
          <p className="faint" style={{ margin: 0 }}>
            {completedSets}/{totalSets} sets
            {sessionDistance(session) > 0
              ? ` · ${formatDistance(sessionDistance(session))}`
              : ` · ${Math.round(sessionVolume(session)).toLocaleString()}${data.settings.units} volume`}
          </p>
        </div>
      </div>

      {restEndsAt && <RestTimer endsAt={restEndsAt} onDone={() => setRestEndsAt(null)} />}

      <div style={{ marginTop: 16 }}>
        {session.entries.map((entry, i) => {
          const exercise = byId.get(entry.exerciseId)
          if (!exercise) return null
          return (
            <ExerciseLogCard
              key={`${entry.exerciseId}-${i}`}
              exercise={exercise}
              sets={entry.sets}
              prescribed={entry.prescribed}
              units={data.settings.units}
              onPatch={(setIdx, patch) => patchSet(i, setIdx, patch)}
              onToggle={(setIdx) => toggleSet(i, setIdx)}
              onAddSet={() => addSet(i)}
              onRemoveSet={() => removeSet(i)}
            />
          )
        })}
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="notes">Session notes</label>
        <textarea
          id="notes"
          value={session.notes ?? ''}
          placeholder="How did it feel? Anything to remember for next time?"
          onChange={(e) => updateSession(session.id, { notes: e.target.value })}
        />
      </div>

      <div className="sticky-actions">
        <button className="btn btn-primary btn-block" onClick={finish}>Finish session</button>
      </div>
    </>
  )
}

function ExerciseLogCard({
  exercise, sets, prescribed, units, onPatch, onToggle, onAddSet, onRemoveSet,
}: {
  exercise: Exercise
  sets: SetLog[]
  prescribed?: { sets: number; repRange: [number, number]; weight?: number; distance?: number }
  units: string
  onPatch: (setIdx: number, patch: Partial<SetLog>) => void
  onToggle: (setIdx: number) => void
  onAddSet: () => void
  onRemoveSet: () => void
}) {
  const fields = setFields(exercise.loadType, units)
  const timed = fields.secondary.key === 'seconds'

  // Pace over the sets you have actually completed, shown back to you live.
  const done = sets.filter((s) => s.completed && s.distance && s.seconds)
  const pace = fields.showPace && done.length
    ? formatPace(
        done.reduce((sum, s) => sum + (s.distance ?? 0), 0),
        done.reduce((sum, s) => sum + (s.seconds ?? 0), 0),
        paceUnit(exercise),
      )
    : undefined

  return (
    <div className="card">
      <div className="card-row" style={{ marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0 }}>{exercise.name}</h3>
          {prescribed && (
            <p className="faint" style={{ margin: 0 }}>
              target {prescribed.sets} ×{' '}
              {prescribed.distance
                ? formatDistance(prescribed.distance)
                : timed
                  ? `${repsToSeconds(prescribed.repRange[0])}–${repsToSeconds(prescribed.repRange[1])}s`
                  : `${prescribed.repRange[0]}–${prescribed.repRange[1]}`}
              {prescribed.weight ? ` @ ${prescribed.weight}${units}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="set-grid set-head">
        <div>#</div>
        <div>{fields.primary?.label ?? '—'}</div>
        <div>{fields.secondary.label}</div>
        <div>RPE</div>
        <div>✓</div>
      </div>

      {sets.map((set, j) => (
        <div key={j} className={`set-grid set-row${set.completed ? ' done' : ''}`}>
          <div className="set-num">{j + 1}</div>

          <input
            type="number"
            inputMode="decimal"
            step={fields.primary?.step ?? '1'}
            placeholder={fields.primary ? '0' : '—'}
            disabled={!fields.primary}
            value={(fields.primary ? set[fields.primary.key] : undefined) ?? ''}
            onChange={(e) => {
              if (!fields.primary) return
              const v = e.target.value === '' ? undefined : Number(e.target.value)
              onPatch(j, { [fields.primary.key]: v })
            }}
          />

          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={set[fields.secondary.key] ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? undefined : Number(e.target.value)
              onPatch(j, { [fields.secondary.key]: v })
            }}
          />

          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="1"
            max="10"
            placeholder="–"
            value={set.rpe ?? ''}
            onChange={(e) => onPatch(j, { rpe: e.target.value === '' ? undefined : Number(e.target.value) })}
          />

          <button
            className={`check-btn${set.completed ? ' done' : ''}`}
            onClick={() => onToggle(j)}
            aria-label={set.completed ? `Set ${j + 1} done` : `Mark set ${j + 1} done`}
          >
            ✓
          </button>
        </div>
      ))}

      {pace && (
        <p className="reason" style={{ marginTop: 8 }}>
          {done.length} set{done.length > 1 ? 's' : ''} done · {pace} average
        </p>
      )}

      <div className="btn-group" style={{ marginTop: 8 }}>
        <button className="btn btn-sm btn-ghost" onClick={onAddSet}>+ set</button>
        {sets.length > 1 && <button className="btn btn-sm btn-ghost" onClick={onRemoveSet}>− set</button>}
      </div>
    </div>
  )
}

function RestTimer({ endsAt, onDone }: { endsAt: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(Math.ceil((endsAt - Date.now()) / 1000))
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    const tick = () => {
      const left = Math.ceil((endsAt - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        // Vibrate if the device supports it -- you will not be looking at the screen.
        navigator.vibrate?.([200, 100, 200])
      }
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endsAt])

  const done = remaining <= 0
  const mins = Math.floor(Math.abs(remaining) / 60)
  const secs = Math.abs(remaining) % 60

  return (
    <div className={`banner ${done ? 'banner-warn' : 'banner-info'}`} style={{ marginTop: 12 }}>
      <div className="card-row">
        <span className="mono" style={{ fontSize: 17, fontWeight: 600 }}>
          {done ? '⏰ Rest over' : '⏱'} {done ? '+' : ''}{mins}:{String(secs).padStart(2, '0')}
        </span>
        <button className="btn btn-sm btn-ghost" onClick={onDone}>dismiss</button>
      </div>
    </div>
  )
}

function RecentSessions({ sessions, exercises }: { sessions: Session[]; exercises: Exercise[] }) {
  const { deleteSession, data } = useStore()
  const byId = new Map(exercises.map((e) => [e.id, e]))
  const recent = [...sessions]
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 15)

  if (recent.length === 0) return null

  return (
    <>
      <h2>Recent sessions</h2>
      {recent.map((s) => (
        <div className="card" key={s.id}>
          <div className="card-row">
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0 }}>{s.name}</h3>
              <p className="faint" style={{ margin: 0 }}>
                {new Date(s.startedAt).toLocaleDateString()} ·{' '}
                {s.entries.reduce((n, e) => n + e.sets.filter((x) => x.completed).length, 0)} sets ·{' '}
                {sessionDistance(s) > 0
                  ? formatDistance(sessionDistance(s))
                  : `${Math.round(sessionVolume(s)).toLocaleString()}${data.settings.units}`}
              </p>
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => confirm(`Delete "${s.name}" from ${new Date(s.startedAt).toLocaleDateString()}?`) && deleteSession(s.id)}
            >
              🗑
            </button>
          </div>
          <details style={{ marginTop: 6 }}>
            <summary className="faint" style={{ cursor: 'pointer' }}>Details</summary>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13 }} className="dim">
              {s.entries.map((e, i) => {
                const done = e.sets.filter((x) => x.completed)
                if (done.length === 0) return null
                return (
                  <li key={i}>
                    {byId.get(e.exerciseId)?.name ?? 'Unknown'} —{' '}
                    {done.map((x) => (x.weight ? `${x.weight}×${x.reps ?? '?'}` : `${x.reps ?? x.seconds ?? '?'}`)).join(', ')}
                  </li>
                )
              })}
            </ul>
            {s.notes && <p className="faint" style={{ marginTop: 6 }}>{s.notes}</p>}
          </details>
        </div>
      ))}
    </>
  )
}
