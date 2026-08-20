/**
 * The program editor.
 *
 * A program is a list of days, and a day is a list of slots -- requirements
 * rather than exercises. So this edits requirements: "knee-dominant push, 4
 * sets of 5-8, 180s rest", and the generator fills it at run time. That is why
 * there is no exercise picker here except the optional pin.
 *
 * `saveProgram` has existed in the store since the beginning and no screen ever
 * called it. This is that screen.
 */

import { useState } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import type {
  DayTemplate, MovementPattern, Program, Rotation, Slot, SlotRole,
} from '../types'

const PATTERNS: MovementPattern[] = [
  'squat', 'lunge', 'hinge', 'push-horizontal', 'push-vertical', 'pull-horizontal',
  'pull-vertical', 'carry', 'core-anti-extension', 'core-anti-rotation', 'core-flexion',
  'isolation', 'conditioning', 'swim', 'run', 'protocol', 'mobility', 'stretch',
]

const ROLES: SlotRole[] = ['warmup', 'primary', 'secondary', 'accessory', 'finisher']
const ROTATIONS: Rotation[] = ['fixed', 'rotate', 'random']

const ROTATION_HELP: Record<Rotation, string> = {
  fixed: 'Always the pinned exercise. For a lift you want to progress in a straight line.',
  rotate: 'Whatever you have done least recently. Maximum variety, no repeats.',
  random: 'Weighted random from everything eligible. Surprise me.',
}

function blankSlot(): Slot {
  return {
    id: uid('slot-'),
    label: 'New slot',
    role: 'accessory',
    patterns: ['isolation'],
    sets: 3,
    repRange: [8, 12],
    restSeconds: 90,
    rotation: 'rotate',
  }
}

export default function ProgramEditor({
  program, onClose,
}: {
  program?: Program
  onClose: () => void
}) {
  const { saveProgram, deleteProgram } = useStore()
  const [draft, setDraft] = useState<Program>(
    program ?? {
      id: uid('prog-'),
      name: '',
      description: '',
      days: [{ id: uid('day-'), name: 'Day 1', slots: [blankSlot()] }],
      createdAt: new Date().toISOString(),
    },
  )
  const [openDay, setOpenDay] = useState(0)

  function patchDay(index: number, patch: Partial<DayTemplate>) {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    }))
  }

  function patchSlot(dayIndex: number, slotIndex: number, patch: Partial<Slot>) {
    setDraft((d) => ({
      ...d,
      days: d.days.map((day, i) =>
        i === dayIndex
          ? { ...day, slots: day.slots.map((s, j) => (j === slotIndex ? { ...s, ...patch } : s)) }
          : day,
      ),
    }))
  }

  const day = draft.days[openDay]

  return (
    <div className="editor">
      <div className="card-row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{program ? 'Edit program' : 'New program'}</h2>
        <button className="btn btn-sm" onClick={onClose}>← Back</button>
      </div>

      <div className="field">
        <label htmlFor="p-name">Name</label>
        <input
          id="p-name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Hyrox build"
        />
      </div>

      <div className="field">
        <label htmlFor="p-desc">What it is for</label>
        <input
          id="p-desc"
          value={draft.description ?? ''}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="strength plus stations, three days"
        />
      </div>

      <h3>Days</h3>
      <div className="segmented" style={{ flexWrap: 'wrap' }}>
        {draft.days.map((d, i) => (
          <button key={d.id} className={i === openDay ? 'is-on' : ''} onClick={() => setOpenDay(i)}>
            {d.name || `Day ${i + 1}`}
          </button>
        ))}
        <button
          onClick={() => {
            setDraft((d) => ({
              ...d,
              days: [...d.days, { id: uid('day-'), name: `Day ${d.days.length + 1}`, slots: [blankSlot()] }],
            }))
            setOpenDay(draft.days.length)
          }}
        >
          +
        </button>
      </div>

      {day && (
        <>
          <div className="field-row">
            <div className="field">
              <label htmlFor="d-name">Day name</label>
              <input id="d-name" value={day.name} onChange={(e) => patchDay(openDay, { name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="d-focus">Focus</label>
              <input
                id="d-focus"
                value={day.focus ?? ''}
                onChange={(e) => patchDay(openDay, { focus: e.target.value })}
                placeholder="squat-led, heavier"
              />
            </div>
          </div>

          {draft.days.length > 1 && (
            <button
              className="btn btn-sm btn-danger"
              style={{ marginBottom: 12 }}
              onClick={() => {
                setDraft((d) => ({ ...d, days: d.days.filter((_, i) => i !== openDay) }))
                setOpenDay(0)
              }}
            >
              Delete this day
            </button>
          )}

          {day.slots.map((slot, j) => (
            <SlotEditor
              key={slot.id}
              slot={slot}
              onChange={(patch) => patchSlot(openDay, j, patch)}
              onDelete={
                day.slots.length > 1
                  ? () => patchDay(openDay, { slots: day.slots.filter((_, i) => i !== j) })
                  : undefined
              }
            />
          ))}

          <button
            className="btn btn-block"
            onClick={() => patchDay(openDay, { slots: [...day.slots, blankSlot()] })}
          >
            + Add a slot
          </button>
        </>
      )}

      <div className="sticky-actions">
        <button
          className="btn btn-primary btn-block"
          disabled={!draft.name.trim()}
          onClick={() => {
            saveProgram({ ...draft, name: draft.name.trim() })
            onClose()
          }}
        >
          Save program
        </button>
        {program && (
          <button
            className="btn btn-danger btn-block"
            style={{ marginTop: 8 }}
            onClick={() => {
              if (!confirm(`Delete "${program.name}"? Sessions you already logged are kept.`)) return
              deleteProgram(program.id)
              onClose()
            }}
          >
            Delete program
          </button>
        )}
      </div>
    </div>
  )
}

function SlotEditor({
  slot, onChange, onDelete,
}: {
  slot: Slot
  onChange: (patch: Partial<Slot>) => void
  onDelete?: () => void
}) {
  const { data } = useStore()
  const [open, setOpen] = useState(false)

  const eligible = data.exercises.filter(
    (e) => !e.archived && e.status !== 'unwatched' && slot.patterns.includes(e.pattern),
  )

  return (
    <div className="card">
      <div className="card-row">
        <div style={{ minWidth: 0 }}>
          <input
            className="slot-label"
            value={slot.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
          <p className="faint mono" style={{ margin: '2px 0 0', fontSize: 13 }}>
            {slot.sets} × {slot.repRange[0]}–{slot.repRange[1]} · {slot.restSeconds}s ·{' '}
            {slot.patterns.join(', ')}
          </p>
          <p className="reason" style={{ marginTop: 2 }}>
            {eligible.length} exercise{eligible.length === 1 ? '' : 's'} in your library can fill this
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => setOpen((v) => !v)}>{open ? '▲' : '▼'}</button>
      </div>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div className="field">
            <label>Movement patterns</label>
            <p className="faint" style={{ margin: '0 0 6px' }}>
              Anything matching one of these can fill the slot. This is the setting that decides
              everything else.
            </p>
            <div className="chips">
              {PATTERNS.map((p) => (
                <span
                  key={p}
                  className={`chip selectable${slot.patterns.includes(p) ? ' on' : ''}`}
                  onClick={() => {
                    const next = slot.patterns.includes(p)
                      ? slot.patterns.filter((x) => x !== p)
                      : [...slot.patterns, p]
                    // A slot with no pattern can never be filled by anything.
                    if (next.length > 0) onChange({ patterns: next })
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor={`${slot.id}-role`}>Role</label>
              <select
                id={`${slot.id}-role`}
                value={slot.role}
                onChange={(e) => onChange({ role: e.target.value as SlotRole })}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${slot.id}-sets`}>Sets</label>
              <input
                id={`${slot.id}-sets`}
                type="number"
                inputMode="numeric"
                min="1"
                value={slot.sets}
                onChange={(e) => onChange({ sets: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor={`${slot.id}-lo`}>Reps from</label>
              <input
                id={`${slot.id}-lo`}
                type="number"
                inputMode="numeric"
                value={slot.repRange[0]}
                onChange={(e) => onChange({ repRange: [Number(e.target.value), slot.repRange[1]] })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${slot.id}-hi`}>to</label>
              <input
                id={`${slot.id}-hi`}
                type="number"
                inputMode="numeric"
                value={slot.repRange[1]}
                onChange={(e) => onChange({ repRange: [slot.repRange[0], Number(e.target.value)] })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${slot.id}-rest`}>Rest (s)</label>
              <input
                id={`${slot.id}-rest`}
                type="number"
                inputMode="numeric"
                value={slot.restSeconds}
                onChange={(e) => onChange({ restSeconds: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`${slot.id}-rot`}>Variety</label>
            <select
              id={`${slot.id}-rot`}
              value={slot.rotation}
              onChange={(e) => onChange({ rotation: e.target.value as Rotation })}
            >
              {ROTATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="faint" style={{ marginTop: 4 }}>{ROTATION_HELP[slot.rotation]}</p>
          </div>

          {slot.rotation === 'fixed' && (
            <div className="field">
              <label htmlFor={`${slot.id}-pin`}>Pinned exercise</label>
              <select
                id={`${slot.id}-pin`}
                value={slot.pinnedExerciseId ?? ''}
                onChange={(e) => onChange({ pinnedExerciseId: e.target.value || undefined })}
              >
                <option value="">— pick one —</option>
                {eligible.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          {onDelete && (
            <button className="btn btn-sm btn-danger" onClick={onDelete}>Remove slot</button>
          )}
        </div>
      )}
    </div>
  )
}
