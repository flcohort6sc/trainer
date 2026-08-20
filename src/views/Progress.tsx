import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import { strengthHistory, sessionVolume, estimate1RM } from '../engine/progression'
import { weeklyReview } from '../engine/coach'
import LineChart, { type Point } from '../components/LineChart'

export default function Progress() {
  const { data, addMetric, deleteMetric } = useStore()
  const [showMetricForm, setShowMetricForm] = useState(false)
  const [trackedExerciseId, setTrackedExerciseId] = useState('')

  const finished = useMemo(
    () => data.sessions.filter((s) => s.finishedAt),
    [data.sessions],
  )

  // Exercises with at least two weighted sessions -- anything less has no trend.
  const trackable = useMemo(() => {
    return data.exercises
      .map((e) => ({ exercise: e, history: strengthHistory(e.id, finished) }))
      .filter((x) => x.history.length >= 2)
      .sort((a, b) => b.history.length - a.history.length)
  }, [data.exercises, finished])

  const selected = trackable.find((t) => t.exercise.id === trackedExerciseId) ?? trackable[0]

  const weightPoints: Point[] = data.metrics
    .filter((m) => m.weight !== undefined)
    .map((m) => ({ date: m.date, value: m.weight! }))

  // --- headline stats ---
  const last7 = finished.filter(
    (s) => Date.now() - new Date(s.startedAt).getTime() < 7 * 24 * 60 * 60 * 1000,
  )
  const totalVolume = finished.reduce((sum, s) => sum + sessionVolume(s), 0)
  const streak = useMemo(() => computeWeekStreak(finished.map((s) => s.date)), [finished])

  return (
    <>
      <h1>Progress</h1>
      <p className="subtitle">Everything here is computed from what you have logged.</p>

      <Review />

      <h2>Totals</h2>
      <div className="stat-row">
        <div className="stat">
          <div className="value mono">{finished.length}</div>
          <div className="label">Sessions</div>
        </div>
        <div className="stat">
          <div className="value mono">{last7.length}</div>
          <div className="label">This week</div>
        </div>
        <div className="stat">
          <div className="value mono">{streak}</div>
          <div className="label">Week streak</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="value mono">
            {totalVolume > 1000 ? `${Math.round(totalVolume / 1000)}k` : Math.round(totalVolume)}
          </div>
          <div className="label">Total volume ({data.settings.units})</div>
        </div>
        <div className="stat">
          <div className="value mono">
            {finished.reduce((n, s) => n + s.entries.reduce((m, e) => m + e.sets.filter((x) => x.completed).length, 0), 0)}
          </div>
          <div className="label">Sets logged</div>
        </div>
      </div>

      {/* ---------- strength ---------- */}
      <h2>Strength</h2>
      {trackable.length === 0 ? (
        <div className="card">
          <p className="dim" style={{ margin: 0 }}>
            Log the same exercise across two sessions and its strength trend appears here.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="field">
            <label htmlFor="track">Exercise</label>
            <select
              id="track"
              value={selected?.exercise.id ?? ''}
              onChange={(e) => setTrackedExerciseId(e.target.value)}
            >
              {trackable.map((t) => (
                <option key={t.exercise.id} value={t.exercise.id}>
                  {t.exercise.name} ({t.history.length} sessions)
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <>
              <h3 style={{ margin: '4px 0 0' }}>Estimated 1RM — {selected.exercise.name}</h3>
              <p className="faint" style={{ margin: '0 0 6px' }}>
                Best set each session, converted to a one-rep max via the Epley formula.
                Useful as a trend line, not as a number to attempt.
              </p>
              <LineChart
                points={selected.history.map((h) => ({ date: h.startedAt, value: h.e1rm }))}
                unit={data.settings.units}
                precision={1}
              />
              <TrendSummary
                first={selected.history[0].e1rm}
                last={selected.history[selected.history.length - 1].e1rm}
                unit={data.settings.units}
              />
            </>
          )}
        </div>
      )}

      {/* ---------- bodyweight ---------- */}
      <h2>Body</h2>
      <div className="card">
        <div className="card-row" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Bodyweight</h3>
          <button className="btn btn-sm btn-primary" onClick={() => setShowMetricForm((v) => !v)}>
            {showMetricForm ? 'Cancel' : '+ Entry'}
          </button>
        </div>

        {showMetricForm && (
          <MetricForm
            units={data.settings.units}
            onSave={(m) => {
              addMetric(m)
              setShowMetricForm(false)
            }}
          />
        )}

        {weightPoints.length >= 2 ? (
          <>
            <LineChart points={weightPoints} unit={data.settings.units} precision={1} />
            <TrendSummary
              first={weightPoints[0].value}
              last={weightPoints[weightPoints.length - 1].value}
              unit={data.settings.units}
              invertColors
            />
          </>
        ) : (
          <p className="faint" style={{ margin: 0 }}>
            {weightPoints.length === 1
              ? 'One entry logged. Add another to see a trend.'
              : 'No entries yet.'}
          </p>
        )}
      </div>

      {data.metrics.length > 0 && (
        <div className="card">
          <h3>Entries</h3>
          {[...data.metrics].reverse().slice(0, 20).map((m) => (
            <div className="list-item" key={m.id}>
              <div>
                <span className="mono">{m.date}</span>{' '}
                {m.weight !== undefined && <strong>{m.weight}{data.settings.units}</strong>}
                {m.bodyFatPct !== undefined && <span className="dim"> · {m.bodyFatPct}% bf</span>}
                {m.note && <div className="faint">{m.note}</div>}
                {m.measurements && Object.keys(m.measurements).length > 0 && (
                  <div className="faint">
                    {Object.entries(m.measurements).map(([k, v]) => `${k} ${v}`).join(' · ')}
                  </div>
                )}
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => deleteMetric(m.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- personal records ---------- */}
      <h2>Personal records</h2>
      <PersonalRecords />
    </>
  )
}

/**
 * The weekly review: `engine/coach.ts` run over your own history.
 *
 * Every line carries the number it came from, because an observation you cannot
 * check is just an opinion the app is not entitled to have. Nothing here is
 * generated, predicted or phoned home for -- if the rules have nothing to say,
 * the review says that instead of filling the space.
 */
function Review() {
  const { data } = useStore()
  const review = useMemo(() => weeklyReview(data), [data])

  return (
    <>
      <div className="card-row" style={{ alignItems: 'baseline', marginBottom: 6 }}>
        <h2 style={{ margin: 0 }}>This week</h2>
        {!review.thin && (
          <span className="faint mono">
            {review.sessions} session{review.sessions === 1 ? '' : 's'} · {review.routines} routine
            {review.routines === 1 ? '' : 's'} · {review.sets} sets
          </span>
        )}
      </div>

      {review.insights.map((i) => (
        <div key={i.id} className={`insight insight-${i.tone}`}>
          <p className="insight-headline">{i.headline}</p>
          <p className="insight-evidence mono">{i.evidence}</p>
          {i.suggestion && <p className="insight-suggestion">{i.suggestion}</p>}
        </div>
      ))}

      {!review.thin && (
        <details style={{ marginBottom: 14 }}>
          <summary className="faint" style={{ cursor: 'pointer' }}>
            Sets per muscle group
          </summary>
          <div className="card" style={{ marginTop: 8 }}>
            <p className="faint" style={{ margin: '0 0 6px' }}>
              Completed sets, counted against an exercise's primary muscles only. Last 7 days,
              then last 28.
            </p>
            {review.volumeByGroup.map((g) => (
              <div className="list-item" key={g.group}>
                <div>{g.group}</div>
                <div className="mono">
                  <strong>{g.last7}</strong> <span className="faint">/ {g.last28}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  )
}

function TrendSummary({
  first, last, unit, invertColors = false,
}: {
  first: number
  last: number
  unit: string
  invertColors?: boolean
}) {
  const delta = last - first
  const pct = first > 0 ? (delta / first) * 100 : 0
  // For bodyweight there is no universally "good" direction, so stay neutral.
  const cls = invertColors ? 'dim' : delta > 0 ? 'direction-up' : delta < 0 ? 'direction-down' : 'dim'

  return (
    <p className={`mono ${cls}`} style={{ fontSize: 13, margin: '6px 0 0' }}>
      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}{unit} ({delta >= 0 ? '+' : ''}{pct.toFixed(1)}%) since first entry
    </p>
  )
}

function PersonalRecords() {
  const { data } = useStore()
  const finished = data.sessions.filter((s) => s.finishedAt)

  const records = useMemo(() => {
    const byExercise = new Map<string, { weight: number; reps: number; e1rm: number; date: string }>()

    for (const session of finished) {
      for (const entry of session.entries) {
        for (const set of entry.sets) {
          if (!set.completed || !set.weight || !set.reps) continue
          const e1rm = estimate1RM(set.weight, set.reps)
          const current = byExercise.get(entry.exerciseId)
          if (!current || e1rm > current.e1rm) {
            byExercise.set(entry.exerciseId, { weight: set.weight, reps: set.reps, e1rm, date: session.date })
          }
        }
      }
    }

    const names = new Map(data.exercises.map((e) => [e.id, e.name]))
    return [...byExercise.entries()]
      .map(([id, r]) => ({ name: names.get(id) ?? 'Unknown', ...r }))
      .sort((a, b) => b.e1rm - a.e1rm)
  }, [finished, data.exercises])

  if (records.length === 0) {
    return (
      <div className="card">
        <p className="dim" style={{ margin: 0 }}>Log some weighted sets and your best lifts show up here.</p>
      </div>
    )
  }

  return (
    <div className="card">
      {records.map((r) => (
        <div className="list-item" key={r.name}>
          <div>
            <div>{r.name}</div>
            <div className="faint">{r.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono"><strong>{r.weight}{data.settings.units} × {r.reps}</strong></div>
            <div className="faint mono">≈{r.e1rm.toFixed(1)} 1RM</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricForm({ units, onSave }: { units: string; onSave: (m: ReturnType<typeof buildMetric>) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [note, setNote] = useState('')
  const [waist, setWaist] = useState('')
  const [chest, setChest] = useState('')
  const [arm, setArm] = useState('')

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="m-date">Date</label>
          <input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="m-weight">Weight ({units})</label>
          <input id="m-weight" type="number" inputMode="decimal" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
      </div>

      <details>
        <summary className="faint" style={{ cursor: 'pointer', marginBottom: 10 }}>Body fat & measurements</summary>
        <div className="field">
          <label htmlFor="m-bf">Body fat %</label>
          <input id="m-bf" type="number" inputMode="decimal" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="m-chest">Chest</label>
            <input id="m-chest" type="number" inputMode="decimal" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="m-waist">Waist</label>
            <input id="m-waist" type="number" inputMode="decimal" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="m-arm">Arm</label>
            <input id="m-arm" type="number" inputMode="decimal" step="0.1" value={arm} onChange={(e) => setArm(e.target.value)} />
          </div>
        </div>
      </details>

      <div className="field">
        <label htmlFor="m-note">Note</label>
        <input id="m-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="morning, fasted…" />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => onSave(buildMetric({ date, weight, bodyFat, note, chest, waist, arm }))}
      >
        Save entry
      </button>
    </div>
  )
}

function buildMetric(raw: {
  date: string; weight: string; bodyFat: string; note: string
  chest: string; waist: string; arm: string
}) {
  const measurements: Record<string, number> = {}
  if (raw.chest) measurements.chest = Number(raw.chest)
  if (raw.waist) measurements.waist = Number(raw.waist)
  if (raw.arm) measurements.arm = Number(raw.arm)

  return {
    id: uid('m-'),
    date: raw.date,
    weight: raw.weight ? Number(raw.weight) : undefined,
    bodyFatPct: raw.bodyFat ? Number(raw.bodyFat) : undefined,
    note: raw.note.trim() || undefined,
    measurements: Object.keys(measurements).length ? measurements : undefined,
  }
}

/** Consecutive ISO weeks, counting back from this week, containing >=1 session. */
function computeWeekStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const weeks = new Set(dates.map((d) => isoWeekKey(new Date(d))))

  let streak = 0
  const cursor = new Date()
  // Allow the current week to be empty -- it may simply not have happened yet.
  if (!weeks.has(isoWeekKey(cursor))) cursor.setDate(cursor.getDate() - 7)

  while (weeks.has(isoWeekKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${week}`
}
