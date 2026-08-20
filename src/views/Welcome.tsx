/**
 * The front door, and the first five questions.
 *
 * Two jobs in one screen because they are the same screen. Anyone landing on
 * the public URL needs to know what this is; anyone opening it for real needs
 * to tell it the handful of things it cannot possibly guess — where you train,
 * which program, whether there is a race.
 *
 * It shows once. After that the app opens on Today, because a front door you
 * have to walk past every morning is a wall.
 *
 * Nothing here is required. Skip it and you get sensible defaults and an app
 * that says what it assumed.
 */

import { useState } from 'react'
import { useStore } from '../store'
import { withPlace } from '../engine/places'
import { GOAL_LABEL } from '../engine/goals'
import { uid } from '../storage/repository'
import type { GoalKind } from '../types'

const PROGRAM_BLURB: Record<string, string> = {
  'prog-full-body': 'Everything each session. The best default if you train two or three times a week.',
  'prog-upper-lower': 'Four days, split top and bottom. More volume per muscle than full body.',
  'prog-ppl': 'Push, pull, legs. Three or six days, the most focused way to split a week.',
  'prog-home': 'A mat, a floor and whatever you own. No gym required.',
}

export default function Welcome({ onDone }: { onDone: () => void }) {
  const { data, updateSettings, saveGoal } = useStore()
  const [step, setStep] = useState(0)
  const [goalKind, setGoalKind] = useState<GoalKind | 'none'>('none')
  const [goalDate, setGoalDate] = useState('')

  const places = data.settings.places ?? []
  const programs = data.programs.filter((p) => !p.archived && !['prog-swim', 'prog-run'].includes(p.id))
  const shape = data.settings.weeklyShape

  function finish() {
    if (goalKind !== 'none') {
      saveGoal({
        id: uid('goal-'),
        kind: goalKind,
        name: GOAL_LABEL[goalKind],
        date: goalDate || undefined,
        createdAt: new Date().toISOString(),
      })
    }
    onDone()
  }

  return (
    <div className="welcome">
      {step === 0 && (
        <>
          <p className="welcome-kicker">Trainer</p>
          <h1 className="welcome-title">
            A training app that decides <em>with</em> you, not for you.
          </h1>

          <p className="welcome-lede">
            It stores what a session needs — “a knee-dominant push, four sets of five to eight” —
            and fills it from your own library at the moment you tap Generate. Change your kit and
            today’s session re-plans around it. Add an exercise and it is eligible everywhere it
            fits, immediately.
          </p>

          <div className="welcome-facts">
            <div><strong>{data.exercises.filter((e) => !e.archived).length}</strong><span>exercises, each with a figure you can turn and play</span></div>
            <div><strong>{data.routines.length}</strong><span>timed routines, run hands-free</span></div>
            <div><strong>0</strong><span>accounts, servers, or bytes of your data leaving this device</span></div>
          </div>

          <p className="faint">
            Everything you log lives in this browser. There is no sync, because there is nothing to
            sync to — export a backup from Settings and that file is the only copy.
          </p>

          <div className="sticky-actions">
            <button className="btn btn-primary btn-block" onClick={() => setStep(1)}>Set it up — 4 questions</button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 6 }} onClick={onDone}>
              Skip, use the defaults
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <Step title="Where do you train most?" hint="You can add more later. The generator only ever offers what is in the room you are standing in." onBack={() => setStep(0)} onNext={() => setStep(2)}>
          {places.map((p) => (
            <button
              key={p.id}
              className={`sheet-row${p.id === data.settings.currentPlaceId ? ' is-on' : ''}`}
              onClick={() => updateSettings(withPlace(data.settings, p.id))}
            >
              <span className="place-icon">{p.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
              <span className="faint">{p.equipment.length} things</span>
            </button>
          ))}
        </Step>
      )}

      {step === 2 && (
        <Step title="How should the week be split?" hint="This is what books your gym days. All of them adapt to your kit — the difference is how the work is divided." onBack={() => setStep(1)} onNext={() => setStep(3)}>
          {programs.map((p) => (
            <button
              key={p.id}
              className={`sheet-row${p.id === (data.settings.activeProgramId ?? 'prog-full-body') ? ' is-on' : ''}`}
              style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 2, minHeight: 64, padding: 12 }}
              onClick={() => updateSettings({ activeProgramId: p.id })}
            >
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span className="faint" style={{ textAlign: 'left' }}>
                {PROGRAM_BLURB[p.id] ?? `${p.days.length} days`}
              </span>
            </button>
          ))}
        </Step>
      )}

      {step === 3 && (
        <Step title="How many days, roughly?" hint="Intentions, not commandments — a taper week cuts them and a deload cuts them further." onBack={() => setStep(2)} onNext={() => setStep(4)}>
          {([
            ['gymDays', 'Gym', 0, 6],
            ['runDays', 'Runs', 0, 6],
            ['swimDays', 'Swims', 0, 5],
          ] as const).map(([key, label, min, max]) => (
            <div className="field" key={key}>
              <label htmlFor={`w-${key}`}>{label}: {shape[key]} a week</label>
              <input
                id={`w-${key}`}
                type="range" min={min} max={max} step="1"
                value={shape[key]}
                onChange={(e) => updateSettings({ weeklyShape: { ...shape, [key]: Number(e.target.value) } })}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="w-long">Long run on</label>
            <select
              id="w-long"
              value={shape.longRunWeekday}
              onChange={(e) => updateSettings({ weeklyShape: { ...shape, longRunWeekday: Number(e.target.value) } })}
            >
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </div>
        </Step>
      )}

      {step === 4 && (
        <Step title="Training for anything?" hint="A goal with no date gets base training and an honest label — never a made-up countdown." onBack={() => setStep(3)} onNext={finish} nextLabel="Done">
          <div className="field">
            <label htmlFor="w-goal">Event</label>
            <select id="w-goal" value={goalKind} onChange={(e) => setGoalKind(e.target.value as GoalKind | 'none')}>
              <option value="none">Nothing specific — general fitness</option>
              {(['hyrox', 'marathon', 'half-marathon', 'triathlon'] as GoalKind[]).map((k) => (
                <option key={k} value={k}>{GOAL_LABEL[k]}</option>
              ))}
            </select>
          </div>
          {goalKind !== 'none' && (
            <div className="field">
              <label htmlFor="w-date">Date, if it is booked</label>
              <input id="w-date" type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
            </div>
          )}
        </Step>
      )}
    </div>
  )
}

function Step({
  title, hint, children, onBack, onNext, nextLabel = 'Next',
}: {
  title: string
  hint: string
  children: React.ReactNode
  onBack: () => void
  onNext: () => void
  nextLabel?: string
}) {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="faint" style={{ marginTop: -6 }}>{hint}</p>
      {children}
      <div className="sticky-actions">
        <div className="btn-group">
          <button className="btn" style={{ flex: 1 }} onClick={onBack}>← Back</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={onNext}>{nextLabel}</button>
        </div>
      </div>
    </>
  )
}
