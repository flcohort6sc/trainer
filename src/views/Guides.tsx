/**
 * Written guides.
 *
 * Lives inside the Library tab rather than getting its own: six tabs already
 * crowd a 375px phone, and a guide is reference material, which is what the
 * library is for.
 */

import { useState } from 'react'
import { LESSONS, TOPIC_LABEL, type Lesson, type LessonTopic } from '../data/lessons'
import { useStore } from '../store'

const TOPIC_ORDER: LessonTopic[] = ['training', 'nutrition', 'run', 'swim', 'sauna']

export default function Guides() {
  const { data } = useStore()
  const [open, setOpen] = useState<Lesson | null>(null)

  if (open) {
    const related = (open.relatedExerciseIds ?? [])
      .map((id) => data.exercises.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))

    return (
      <>
        <button className="btn btn-sm" onClick={() => setOpen(null)}>‹ All guides</button>
        <p className="faint" style={{ margin: '14px 0 2px' }}>{TOPIC_LABEL[open.topic]}</p>
        <h1 style={{ marginTop: 0 }}>{open.title}</h1>

        <article className="prose">
          {open.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </article>

        {open.sourceUrl && (
          <p className="faint" style={{ fontSize: 13 }}>
            Drawn from a reel by {open.creator ? `@${open.creator}` : 'an unnamed creator'} —{' '}
            <a href={open.sourceUrl} target="_blank" rel="noreferrer">watch it ↗</a>
          </p>
        )}

        {related.length > 0 && (
          <>
            <h2>Exercises this covers</h2>
            {related.map((e) => (
              <div className="list-item" key={e.id}>
                <div style={{ minWidth: 0 }}>
                  <div>{e.name}</div>
                  <div className="faint">{e.cues[0] ?? e.equipment.join(', ')}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <p className="subtitle" style={{ marginTop: 4 }}>
        The reasoning behind what the app asks you to do. Short, opinionated, and written to be
        read once.
      </p>

      {TOPIC_ORDER.map((topic) => {
        const lessons = LESSONS.filter((l) => l.topic === topic)
        if (lessons.length === 0) return null
        return (
          <div key={topic}>
            <h2>{TOPIC_LABEL[topic]}</h2>
            {lessons.map((lesson) => (
              <button key={lesson.id} className="card card-button" onClick={() => setOpen(lesson)}>
                <div className="card-row">
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0 }}>{lesson.title}</h3>
                    <p className="dim" style={{ fontSize: 13, margin: '4px 0 0' }}>{lesson.summary}</p>
                    {lesson.creator && (
                      <p className="faint" style={{ fontSize: 12, margin: '4px 0 0' }}>@{lesson.creator}</p>
                    )}
                  </div>
                  <span className="dim" style={{ fontSize: 20 }}>›</span>
                </div>
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}
