import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { generateSession, rerollSlot, toSession, type GenerationResult, type GeneratedEntry } from '../engine/generator'
import { leadRoutineKind, suggestRoutine, type RoutineSuggestion } from '../engine/routineGenerator'
import { repsToSeconds, formatDistance } from '../engine/progression'
import { estimateMinutes, fuellingFor } from '../engine/fuelling'
import { routineStreak } from '../engine/coach'
import { planWeek } from '../engine/week'
import BuildSession from './BuildSession'
import Figure from '../components/Figure'
import { figureFor } from '../data/figures'
import type { DayTemplate, Program } from '../types'

/**
 * The day at a glance: one routine suggested for right now, the other kept in
 * view but small.
 *
 * There are seventeen routines. Listing them is the Routines tab's job; this is
 * the screen you open at 06:40 with one eye shut, so it picks. `suggestRoutine`
 * rotates through the ones you have gone longest without, which is how the
 * other four evening routines stop being invisible.
 */
function DayStrip({ goToRoutine }: { goToRoutine: (id: string) => void }) {
  const { data } = useStore()
  const now = Date.now()
  const streak = routineStreak(data.routineLogs, now)

  const morningLeads = leadRoutineKind(now) === 'wake'

  const wake = suggestRoutine('wake', data, now)
  const wind = suggestRoutine('wind-down', data, now)
  const lead = morningLeads ? wake : wind
  const second = morningLeads ? wind : wake
  const iconFor = (s: RoutineSuggestion) => (s.doneToday ? '✓' : s.routine.kind === 'wake' ? '🌅' : '🌙')
  const whenFor = (s: RoutineSuggestion) => (s.routine.kind === 'wake' ? 'Morning' : 'Evening')

  return (
    <>
      <div className="day-strip">
        {lead && (
          <button
            className={`day-card is-lead${lead.doneToday ? ' is-done' : ''}`}
            onClick={() => goToRoutine(lead.routine.id)}
          >
            <span className="day-icon">{iconFor(lead)}</span>
            <span className="day-when">{whenFor(lead)}</span>
            <span className="day-name">{lead.routine.name}</span>
            <span className="faint">
              {lead.routine.targetMinutes} min
              {lead.candidates > 1 && ` · 1 of ${lead.candidates}`}
            </span>
            <span className="reason">{lead.reason}</span>
          </button>
        )}

        {second && (
          <button
            className={`day-card is-second${second.doneToday ? ' is-done' : ''}`}
            onClick={() => goToRoutine(second.routine.id)}
          >
            <span className="day-icon">{iconFor(second)}</span>
            <span className="day-when">{whenFor(second)}</span>
            <span className="day-name">{second.routine.name}</span>
            <span className="faint day-mins">{second.routine.targetMinutes} min</span>
          </button>
        )}
      </div>
      {streak > 0 && (
        <p className="faint" style={{ margin: '0 0 8px' }}>
          🔥 {streak} day routine streak
        </p>
      )}
    </>
  )
}

export default function Today({
  goToLog, goToRoutine,
}: {
  goToLog: () => void
  goToRoutine: (id: string) => void
}) {
  const { data, startSession, activeSession } = useStore()

  /**
   * What the week says today is.
   *
   * Today used to open on two dropdowns while Plan had already decided that
   * Thursday was a gym day from a named program. Two screens disagreeing about
   * the same day is worse than either answer, so Today follows the week and the
   * pickers become an override for when the week is wrong.
   */
  const todaysPlan = useMemo(() => {
    const week = planWeek(data)
    const today = week.days.find((d) => d.isToday)
    return today?.items.find((i) => i.programId) ?? undefined
  }, [data])

  const [programId, setProgramId] = useState(
    todaysPlan?.programId ?? data.programs[0]?.id ?? '',
  )
  const [dayId, setDayId] = useState(
    todaysPlan?.dayTemplateId ?? data.programs[0]?.days[0]?.id ?? '',
  )
  const [overriding, setOverriding] = useState(false)
  const [building, setBuilding] = useState(false)
  const [plan, setPlan] = useState<GenerationResult | null>(null)
  const [swapFor, setSwapFor] = useState<number | null>(null)

  const program: Program | undefined = data.programs.find((p) => p.id === programId)
  const day: DayTemplate | undefined = program?.days.find((d) => d.id === dayId)

  // Which day would you naturally do next? Whichever you did least recently.
  const suggestedDayId = useMemo(() => {
    if (!program) return undefined
    let oldest: { id: string; t: number } | null = null
    for (const d of program.days) {
      const last = data.sessions
        .filter((s) => s.dayTemplateId === d.id)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
      const t = last ? new Date(last.startedAt).getTime() : 0
      if (!oldest || t < oldest.t) oldest = { id: d.id, t }
    }
    return oldest?.id
  }, [program, data.sessions])

  function selectProgram(id: string) {
    setProgramId(id)
    const p = data.programs.find((x) => x.id === id)
    setDayId(p?.days[0]?.id ?? '')
    setPlan(null)
  }

  function generate() {
    if (!day) return
    setPlan(generateSession(day, data))
  }

  function reroll(index: number) {
    if (!plan) return
    const entry = plan.entries[index]
    const others = plan.entries.filter((_, i) => i !== index).map((e) => e.exercise.id)
    const next = rerollSlot(entry.slot, data, others, entry.exercise.id)
    if (!next) {
      alert('No other exercise fits this slot with your current equipment.')
      return
    }
    const entries = [...plan.entries]
    entries[index] = next
    setPlan({ ...plan, entries })
  }

  function swapTo(index: number, exerciseId: string) {
    if (!plan) return
    const exercise = data.exercises.find((e) => e.id === exerciseId)
    if (!exercise) return
    const entries = [...plan.entries]
    entries[index] = { ...entries[index], exercise, reason: 'you picked it' }
    setPlan({ ...plan, entries })
    setSwapFor(null)
  }

  function start() {
    if (!day || !plan) return
    startSession(toSession(day, programId, plan))
    goToLog()
  }

  if (building) {
    return <BuildSession onStarted={() => { setBuilding(false); goToLog() }} onCancel={() => setBuilding(false)} />
  }

  if (activeSession) {
    return (
      <>
        <h1>Today</h1>
        <DayStrip goToRoutine={goToRoutine} />
        <p className="subtitle">You have a session in progress.</p>
        <div className="card">
          <h3>{activeSession.name}</h3>
          <p className="faint">
            Started {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {activeSession.entries.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)} sets done
          </p>
          <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={goToLog}>
            Continue session
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1>Today</h1>
      <DayStrip goToRoutine={goToRoutine} />

      <h2 style={{ marginTop: 20 }}>{todaysPlan ? todaysPlan.label : 'Gym'}</h2>

      {todaysPlan && !overriding ? (
        <>
          <p className="reason" style={{ marginTop: -4 }}>{todaysPlan.reason}</p>
          <p className="faint" style={{ margin: '4px 0 10px' }}>
            {/* The heading already carries the program name. */}
            {day?.name}{day?.focus ? ` — ${day.focus}` : ''}
          </p>
          <button className="btn btn-sm btn-ghost" onClick={() => setOverriding(true)}>
            Do something else instead
          </button>
        </>
      ) : (
        <>
          <p className="subtitle">
            {todaysPlan
              ? 'Overriding the week. Pick anything you like.'
              : 'Nothing scheduled today. Pick a day and generate a session.'}
          </p>

          <div className="field">
            <label htmlFor="program">Program</label>
            <select id="program" value={programId} onChange={(e) => selectProgram(e.target.value)}>
              {data.programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {program && (
            <div className="field">
              <label htmlFor="day">Day</label>
              <select id="day" value={dayId} onChange={(e) => { setDayId(e.target.value); setPlan(null) }}>
                {program.days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.id === suggestedDayId ? '  ← up next' : ''}
                  </option>
                ))}
              </select>
              {day?.focus && <p className="faint" style={{ marginTop: 6 }}>{day.focus}</p>}
            </div>
          )}
        </>
      )}

      <button className="btn btn-primary btn-block" onClick={generate} disabled={!day}>
        {plan ? '🎲 Regenerate' : '⚡ Generate session'}
      </button>
      <button className="btn btn-block" style={{ marginTop: 8 }} onClick={() => setBuilding(true)}>
        ✋ Pick the exercises myself
      </button>

      {plan && (
        <>
          <h2>{day?.name}</h2>

          {plan.unfilled.length > 0 && (
            <div className="banner banner-warn">
              <strong>{plan.unfilled.length} slot{plan.unfilled.length > 1 ? 's' : ''} could not be filled:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {plan.unfilled.map((u) => (
                  <li key={u.slot.id}>{u.slot.label} — {u.reason}</li>
                ))}
              </ul>
            </div>
          )}

          <Fuelling plan={plan} />

          {plan.entries.map((entry, i) => (
            <PlannedExercise
              key={entry.slot.id}
              entry={entry}
              units={data.settings.units}
              onReroll={() => reroll(i)}
              onOpenSwap={() => setSwapFor(i)}
            />
          ))}

          <div className="sticky-actions">
            <button className="btn btn-primary btn-block" onClick={start}>
              Start this session
            </button>
          </div>
        </>
      )}

      {swapFor !== null && plan && (
        <SwapModal
          entry={plan.entries[swapFor]}
          onPick={(id) => swapTo(swapFor, id)}
          onClose={() => setSwapFor(null)}
        />
      )}
    </>
  )
}

function PlannedExercise({
  entry, units, onReroll, onOpenSwap,
}: {
  entry: GeneratedEntry
  units: string
  onReroll: () => void
  onOpenSwap: () => void
}) {
  const { slot, exercise, reason, suggestedWeight } = entry
  const [lo, hi] = slot.repRange
  const isTimed = exercise.loadType === 'time' || exercise.loadType === 'weight-time'
  const [dLo, dHi] = slot.distanceRange ?? []

  return (
    <div className="card">
      <div className="card-row">
        <div style={{ minWidth: 0 }}>
          <p className="faint" style={{ margin: 0 }}>{slot.label}</p>
          <h3 style={{ margin: '2px 0' }}>{exercise.name}</h3>
          <p className="mono dim" style={{ margin: 0, fontSize: 14 }}>
            {slot.sets} ×{' '}
            {dLo !== undefined
              ? dLo === dHi
                ? formatDistance(dLo)
                : `${formatDistance(dLo)}–${formatDistance(dHi!)}`
              : isTimed
                ? `${repsToSeconds(lo)}–${repsToSeconds(hi)}s`
                : lo === hi
                  ? lo
                  : `${lo}–${hi}`}
            {suggestedWeight ? ` @ ${suggestedWeight}${units}` : ''}
            {slot.restSeconds > 0 && <span className="faint"> · {slot.restSeconds}s rest</span>}
          </p>
          <p className="reason">{reason}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-sm" onClick={onReroll} title="Pick a different exercise">🎲</button>
          <button className="btn btn-sm" onClick={onOpenSwap} title="Choose manually">⇄</button>
        </div>
      </div>

      {(exercise.cues.length > 0 || figureFor(exercise)) && (
        <details style={{ marginTop: 8 }}>
          <summary className="faint" style={{ cursor: 'pointer' }}>How to do it</summary>
          {figureFor(exercise) && (
            <Figure
              spec={figureFor(exercise)!}
              title={exercise.name}
              size={200}
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
            />
          )}
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13 }} className="dim">
            {exercise.cues.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          {exercise.sourceUrl && (
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              <a href={exercise.sourceUrl} target="_blank" rel="noreferrer">Watch the video ↗</a>
            </p>
          )}
        </details>
      )}
    </div>
  )
}

function SwapModal({
  entry, onPick, onClose,
}: {
  entry: GeneratedEntry
  onPick: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Swap: {entry.slot.label}</h2>
        <p className="faint">Anything here fits the same slot — same movement pattern, equipment you have.</p>

        {entry.alternatives.length === 0 && (
          <p className="dim">No alternatives available with your current equipment.</p>
        )}

        {entry.alternatives.map((alt) => (
          <div key={alt.id} className="list-item">
            <div style={{ minWidth: 0 }}>
              <div>{alt.name}</div>
              <div className="faint">{alt.equipment.join(', ')}</div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => onPick(alt.id)}>Use</button>
          </div>
        ))}

        <button className="btn btn-block" style={{ marginTop: 16 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}


/**
 * Fuelling, but only when the session is long enough to need it.
 *
 * Shown against the generated plan rather than as a guide, because "60-90g of
 * carbohydrate an hour" is useless in the abstract and actionable next to the
 * three-hour run it applies to. Under an hour this renders nothing at all --
 * advice you do not need is noise.
 */
function Fuelling({ plan }: { plan: GenerationResult }) {
  const { data } = useStore()

  const estimate = estimateMinutes(
    plan.entries.map((e) => ({
      pattern: e.exercise.pattern,
      sets: e.slot.sets,
      metresPerSet: e.slot.distanceRange?.[0],
      restSeconds: e.slot.restSeconds,
    })),
    data,
  )

  const fuel = fuellingFor(estimate.minutes, data)
  if (!fuel.needed) return null

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Fuelling</h3>
      <p className="faint" style={{ margin: '0 0 8px' }}>
        {fuel.why}
        {!estimate.fromHistory && estimate.assumption && ` ${estimate.assumption}`}
      </p>

      {fuel.before && <p style={{ margin: '0 0 6px' }}><strong>Before:</strong> {fuel.before}</p>}
      {fuel.during && <p style={{ margin: '0 0 6px' }}><strong>During:</strong> {fuel.during}</p>}
      {fuel.after && <p style={{ margin: '0 0 6px' }}><strong>After:</strong> {fuel.after}</p>}

      <p className="reason">{fuel.basis}</p>
    </div>
  )
}
