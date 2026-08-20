/**
 * The routine editor.
 *
 * Same idea as the program editor: a step is a requirement ("60 seconds of
 * passive hip work"), not a drill. `targetMinutes` is real — the generator keeps
 * adding rotating steps until the routine is roughly that long, so a routine
 * with three steps and a 12-minute target is a legitimate thing to write.
 */

import { useState } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import type { MovementPattern, Rotation, Routine, RoutineKind, RoutineStep } from '../types'

const KINDS: RoutineKind[] = ['wake', 'wind-down', 'flexibility', 'recovery', 'sauna']
const STEP_PATTERNS: MovementPattern[] = ['mobility', 'stretch', 'core-anti-extension', 'isolation', 'protocol', 'conditioning']
const ROTATIONS: Rotation[] = ['fixed', 'rotate', 'random']

function blankStep(): RoutineStep {
  return {
    id: uid('rstep-'),
    label: 'New step',
    patterns: ['mobility'],
    seconds: 45,
    transitionSeconds: 10,
    rotation: 'rotate',
  }
}

export default function RoutineEditor({
  routine, onClose,
}: {
  routine?: Routine
  onClose: () => void
}) {
  const { data, saveRoutine, deleteRoutine } = useStore()
  const [draft, setDraft] = useState<Routine>(
    routine ?? {
      id: uid('rt-'),
      name: '',
      kind: 'wake',
      description: '',
      targetMinutes: 8,
      steps: [blankStep()],
      createdAt: new Date().toISOString(),
    },
  )

  function patchStep(i: number, patch: Partial<RoutineStep>) {
    setDraft((d) => ({ ...d, steps: d.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))
  }

  return (
    <div className="editor">
      <div className="card-row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{routine ? 'Edit routine' : 'New routine'}</h2>
        <button className="btn btn-sm" onClick={onClose}>← Back</button>
      </div>

      <div className="field">
        <label htmlFor="r-name">Name</label>
        <input id="r-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="r-kind">Kind</label>
          <select
            id="r-kind"
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value as RoutineKind })}
          >
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-mins">Target minutes</label>
          <input
            id="r-mins"
            type="number"
            inputMode="numeric"
            min="1"
            value={draft.targetMinutes}
            onChange={(e) => setDraft({ ...draft, targetMinutes: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      </div>

      <p className="faint" style={{ marginTop: -4 }}>
        The steps below are the skeleton. The generator keeps adding rotating extras until the
        routine is roughly this long, so the target is an instruction rather than a label.
      </p>

      <div className="field">
        <label className="check-row">
          <input
            type="checkbox"
            checked={Boolean(draft.situational)}
            onChange={(e) => setDraft({ ...draft, situational: e.target.checked || undefined })}
          />
          <span>
            Situational — only when I choose it
            <span className="faint" style={{ display: 'block' }}>
              Keeps it out of Today's daily rotation. This is what stops a pre-swim warm-up being
              suggested on a morning with no swim in it.
            </span>
          </span>
        </label>
      </div>

      <h3>Steps</h3>
      {draft.steps.map((step, i) => (
        <div className="card" key={step.id}>
          <input
            className="slot-label"
            value={step.label}
            onChange={(e) => patchStep(i, { label: e.target.value })}
          />

          <div className="chips" style={{ margin: '8px 0' }}>
            {STEP_PATTERNS.map((p) => (
              <span
                key={p}
                className={`chip selectable${step.patterns.includes(p) ? ' on' : ''}`}
                onClick={() => {
                  const next = step.patterns.includes(p)
                    ? step.patterns.filter((x) => x !== p)
                    : [...step.patterns, p]
                  if (next.length > 0) patchStep(i, { patterns: next })
                }}
              >
                {p}
              </span>
            ))}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor={`${step.id}-secs`}>Hold (s)</label>
              <input
                id={`${step.id}-secs`}
                type="number"
                inputMode="numeric"
                value={step.seconds}
                onChange={(e) => patchStep(i, { seconds: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${step.id}-trans`}>Transition (s)</label>
              <input
                id={`${step.id}-trans`}
                type="number"
                inputMode="numeric"
                value={step.transitionSeconds}
                onChange={(e) => patchStep(i, { transitionSeconds: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${step.id}-rot`}>Variety</label>
              <select
                id={`${step.id}-rot`}
                value={step.rotation}
                onChange={(e) => patchStep(i, { rotation: e.target.value as Rotation })}
              >
                {ROTATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {step.rotation === 'fixed' && (
            <div className="field">
              <label htmlFor={`${step.id}-pin`}>Pinned drill</label>
              <select
                id={`${step.id}-pin`}
                value={step.pinnedExerciseId ?? ''}
                onChange={(e) => patchStep(i, { pinnedExerciseId: e.target.value || undefined })}
              >
                <option value="">— pick one —</option>
                {data.exercises
                  .filter((e) => !e.archived && step.patterns.includes(e.pattern))
                  .map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          <label className="check-row">
            <input
              type="checkbox"
              checked={Boolean(step.perSide)}
              onChange={(e) => patchStep(i, { perSide: e.target.checked || undefined })}
            />
            <span>Run it twice, once per side</span>
          </label>

          {draft.steps.length > 1 && (
            <button
              className="btn btn-sm btn-danger"
              style={{ marginTop: 8 }}
              onClick={() => setDraft((d) => ({ ...d, steps: d.steps.filter((_, j) => j !== i) }))}
            >
              Remove step
            </button>
          )}
        </div>
      ))}

      <button
        className="btn btn-block"
        onClick={() => setDraft((d) => ({ ...d, steps: [...d.steps, blankStep()] }))}
      >
        + Add a step
      </button>

      <div className="sticky-actions">
        <button
          className="btn btn-primary btn-block"
          disabled={!draft.name.trim()}
          onClick={() => {
            saveRoutine({ ...draft, name: draft.name.trim() })
            onClose()
          }}
        >
          Save routine
        </button>
        {routine && (
          <button
            className="btn btn-danger btn-block"
            style={{ marginTop: 8 }}
            onClick={() => {
              if (!confirm(`Delete "${routine.name}"? Logs you already have are kept.`)) return
              deleteRoutine(routine.id)
              onClose()
            }}
          >
            Delete routine
          </button>
        )}
      </div>
    </div>
  )
}
