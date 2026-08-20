/**
 * The week, the goal, and the routines.
 *
 * Today answers "what now". This answers "what is this week for", which is the
 * question every race plan is really made of. The week itself is derived, never
 * stored -- see engine/week.ts for why.
 */

import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import { planWeek, type PlannedDay, type PlannedItem } from '../engine/week'
import { GOAL_LABEL, goalConflicts, goalStatus } from '../engine/goals'
import Routines from './Routines'
import ProgramEditor from './ProgramEditor'
import RoutineEditor from './RoutineEditor'
import type { Goal, GoalKind, Program, Routine } from '../types'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ITEM_ICON: Record<PlannedItem['kind'], string> = {
  gym: '🏋️',
  run: '🏃',
  swim: '🏊',
  sauna: '🔥',
  rest: '·',
}

type Section = 'week' | 'goals' | 'programs' | 'routines'

export default function Plan({ initialRoutineId }: { initialRoutineId?: string }) {
  const [section, setSection] = useState<Section>(initialRoutineId ? 'routines' : 'week')

  return (
    <>
      <h1>Plan</h1>

      <div className="segmented" style={{ flexWrap: 'wrap' }}>
        {(['week', 'goals', 'programs', 'routines'] as Section[]).map((s) => (
          <button key={s} className={section === s ? 'is-on' : ''} onClick={() => setSection(s)}>
            {s === 'week' ? 'Week' : s === 'goals' ? 'Goals' : s === 'programs' ? 'Programs' : 'Routines'}
          </button>
        ))}
      </div>

      {section === 'week' && <Week />}
      {section === 'goals' && <Goals />}
      {section === 'programs' && <Programs />}
      {section === 'routines' && <RoutinesSection initialRoutineId={initialRoutineId} />}

      {section === 'week' && (
        <p className="faint" style={{ marginTop: 18 }}>
          The week is worked out fresh every time from your weekly shape, your goal and what you
          have already logged — it is never stored, so it cannot go stale. Change the shape in
          Settings.
        </p>
      )}
    </>
  )
}

function Week() {
  const { data } = useStore()
  const week = useMemo(() => planWeek(data), [data])
  const conflicts = useMemo(() => goalConflicts(data), [data])

  return (
    <>
      <div className={`week-header${week.deload ? ' is-deload' : ''}`}>
        <h2 style={{ margin: 0 }}>{week.headline}</h2>
        <p className="faint" style={{ margin: '4px 0 0' }}>{week.note}</p>
      </div>

      {conflicts.map((c) => (
        <div key={`${c.a.id}-${c.b.id}`} className="banner banner-warn">
          <strong>Two races, {c.weeksApart} weeks apart.</strong> {c.message}
        </div>
      ))}

      {/*
        The reason is worth reading once, not four times. Two easy runs in a
        week carry the same sentence, and repeating it turns a scannable week
        into a wall — so it shows on its first appearance and on today, which is
        the row you are actually reading.
      */}
      {(() => {
        const seen = new Set<string>()
        return week.days.map((day) => {
          const showReasons = day.items.map((item) => {
            if (day.isToday) return true
            if (seen.has(item.label)) return false
            seen.add(item.label)
            return true
          })
          return <DayRow key={day.date} day={day} showReasons={showReasons} />
        })
      })()}
    </>
  )
}

function DayRow({ day, showReasons }: { day: PlannedDay; showReasons: boolean[] }) {
  const dayNumber = day.date.slice(8, 10)
  const restOnly = day.items.every((i) => i.kind === 'rest')

  return (
    <div className={`plan-day${day.isToday ? ' is-today' : ''}${day.isPast ? ' is-past' : ''}`}>
      <div className="plan-date">
        <span className="plan-weekday">{WEEKDAY[day.weekday]}</span>
        <span className="plan-daynum mono">{dayNumber}</span>
      </div>

      <div className="plan-items">
        {day.items.map((item, i) => (
          <div key={i} className="plan-item">
            <span className="plan-icon">{ITEM_ICON[item.kind]}</span>
            <div style={{ minWidth: 0 }}>
              <div className={restOnly ? 'dim' : ''}>{item.label}</div>
              {showReasons[i] && <div className="reason">{item.reason}</div>}
            </div>
          </div>
        ))}

        {(day.done.sessions > 0 || day.done.routines > 0) && (
          <p className="plan-done mono">
            ✓ {day.done.sessions > 0 && `${day.done.sessions} session${day.done.sessions > 1 ? 's' : ''}`}
            {day.done.sessions > 0 && day.done.routines > 0 && ' · '}
            {day.done.routines > 0 && `${day.done.routines} routine${day.done.routines > 1 ? 's' : ''}`}
          </p>
        )}
      </div>
    </div>
  )
}

const KINDS: GoalKind[] = ['hyrox', 'marathon', 'half-marathon', 'triathlon', 'general']

function Goals() {
  const { data, saveGoal, deleteGoal } = useStore()
  const [adding, setAdding] = useState(false)
  const goals = data.goals ?? []

  return (
    <>
      {goals.length === 0 && (
        <div className="card">
          <p className="dim" style={{ marginTop: 0 }}>
            No goal yet. Without one this is general hybrid training — which is a perfectly good
            thing to be doing.
          </p>
          <p className="faint" style={{ margin: 0 }}>
            Add a race <strong>with a date</strong> and the weeks start counting: phases, a taper,
            and a warning if two races sit too close together. A goal with no date gets no
            countdown, because there is nothing honest to count.
          </p>
        </div>
      )}

      {goals.map((goal) => <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal(goal.id)} />)}

      {adding ? (
        <GoalForm
          onCancel={() => setAdding(false)}
          onSave={(g) => {
            saveGoal(g)
            setAdding(false)
          }}
        />
      ) : (
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>
          + Add a goal
        </button>
      )}
    </>
  )
}

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
  const status = goalStatus(goal)

  return (
    <div className="card">
      <div className="card-row">
        <div style={{ minWidth: 0 }}>
          <p className="faint" style={{ margin: 0 }}>{GOAL_LABEL[goal.kind]}</p>
          <h3 style={{ margin: '2px 0' }}>{goal.name}</h3>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onDelete} title="Remove this goal">🗑</button>
      </div>

      {status.dated ? (
        <p className="mono" style={{ margin: '4px 0 0' }}>
          {goal.date} · <strong>{status.weeksToRace} week{status.weeksToRace === 1 ? '' : 's'}</strong>
          <span className="faint"> · {status.phase}</span>
        </p>
      ) : (
        <p className="faint" style={{ margin: '4px 0 0' }}>
          No date — base training. Add one and this becomes a countdown.
        </p>
      )}

      <p className="reason" style={{ marginTop: 6 }}>{status.focus}</p>
      {goal.notes && <p className="faint" style={{ margin: '6px 0 0' }}>{goal.notes}</p>}
    </div>
  )
}

function GoalForm({ onSave, onCancel }: { onSave: (g: Goal) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<GoalKind>('hyrox')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>New goal</h3>

      <div className="field">
        <label htmlFor="g-kind">Event</label>
        <select id="g-kind" value={kind} onChange={(e) => setKind(e.target.value as GoalKind)}>
          {KINDS.map((k) => <option key={k} value={k}>{GOAL_LABEL[k]}</option>)}
        </select>
      </div>

      {kind === 'triathlon' && (
        <div className="banner banner-warn">
          The bike is not modelled in this app. Swimming and running are planned properly; cycling
          you will have to log elsewhere and add as notes.
        </div>
      )}

      <div className="field">
        <label htmlFor="g-name">Name it</label>
        <input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hyrox Berlin" />
      </div>

      <div className="field">
        <label htmlFor="g-date">Date (optional)</label>
        <input id="g-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <p className="faint" style={{ marginTop: 4 }}>
          Leave it empty if it is not booked. You get base training and an honest label rather than
          a made-up countdown.
        </p>
      </div>

      <div className="field">
        <label htmlFor="g-notes">Notes</label>
        <input id="g-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="target time, travel…" />
      </div>

      <div className="btn-group">
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              id: uid('goal-'),
              kind,
              name: name.trim(),
              date: date || undefined,
              notes: notes.trim() || undefined,
              createdAt: new Date().toISOString(),
            })
          }
        >
          Save goal
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}


/**
 * Programs, and the editor that was missing.
 *
 * `saveProgram` and `deleteProgram` have been in the store since the first
 * version and no screen ever called them, so a program was something only the
 * source code could change. This is where that stops.
 */
function Programs() {
  const { data, updateSettings } = useStore()
  const [editing, setEditing] = useState<Program | 'new' | undefined>()

  if (editing) {
    return (
      <ProgramEditor
        program={editing === 'new' ? undefined : editing}
        onClose={() => setEditing(undefined)}
      />
    )
  }

  const active = data.settings.activeProgramId ?? data.programs.find((p) => !p.archived)?.id

  return (
    <>
      <p className="faint">
        A program stores <strong>requirements</strong>, not exercises — "a knee-dominant push, 4×5–8,
        heavy" — and the generator fills each one from your library at the moment you tap Generate.
        Edit the requirement and every future session changes with it.
      </p>

      {data.programs.filter((p) => !p.archived).map((program) => (
        <div className="card" key={program.id}>
          <div className="card-row">
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0 }}>{program.name}</h3>
              <p className="faint" style={{ margin: '2px 0 0' }}>
                {program.days.length} day{program.days.length === 1 ? '' : 's'} ·{' '}
                {program.days.reduce((n, d) => n + d.slots.length, 0)} slots
              </p>
              {program.description && <p className="reason">{program.description}</p>}
            </div>
            <button className="btn btn-sm" onClick={() => setEditing(program)}>Edit</button>
          </div>

          <label className="check-row" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={active === program.id}
              onChange={() => updateSettings({ activeProgramId: program.id })}
            />
            <span>Book my gym days from this one</span>
          </label>
        </div>
      ))}

      <button className="btn btn-primary btn-block" onClick={() => setEditing('new')}>
        + New program
      </button>
    </>
  )
}

function RoutinesSection({ initialRoutineId }: { initialRoutineId?: string }) {
  const { data } = useStore()
  const [editing, setEditing] = useState<Routine | 'new' | undefined>()

  if (editing) {
    return (
      <RoutineEditor
        routine={editing === 'new' ? undefined : editing}
        onClose={() => setEditing(undefined)}
      />
    )
  }

  return (
    <>
      <Routines initialRoutineId={initialRoutineId} />

      <hr className="divider" />
      <h3>Edit a routine</h3>
      <p className="faint" style={{ marginTop: -6 }}>
        Change the steps, the length, or whether it should be offered as one of your daily ones.
      </p>
      <div className="chips" style={{ marginBottom: 12 }}>
        {data.routines.filter((r) => !r.archived).map((r) => (
          <span key={r.id} className="chip selectable" onClick={() => setEditing(r)}>
            {r.name}
          </span>
        ))}
      </div>
      <button className="btn btn-block" onClick={() => setEditing('new')}>+ New routine</button>
    </>
  )
}
