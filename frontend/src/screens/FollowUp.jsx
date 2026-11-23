import { useState } from 'react'
import { formatClock } from '../lib/feedback.js'

export default function FollowUp({ task, session, setSession, onDone }) {
  const [step, setStep] = useState(0)
  const questions = task.follow_ups
  const isLast = step === questions.length - 1
  const secsLeft = task.time_limit_sec - Math.floor((session.endedAt - session.startedAt) / 1000)

  function setAnswer(value) {
    setSession((s) => {
      const followUps = [...s.followUps]
      followUps[step] = value
      return { ...s, followUps }
    })
  }

  return (
    <div id="scr-fu">
      <div className="topbar">
        <div className="topbar-brand">
          Smith<em>.</em>
        </div>
        <div className="topbar-sep"></div>
        <div className="topbar-stage">Follow-up Questions</div>
        <div className="ws-timer" style={{ marginLeft: 'auto' }}>
          {formatClock(secsLeft)} remaining
        </div>
      </div>
      <div className="fu-body">
        <div className="fu-code-pane">
          <div className="fu-code-label">Your final code</div>
          <div className="fu-code-view">{session.code}</div>
        </div>
        <div className="fu-main">
          <div className="fu-steps">
            {questions.map((_, j) => (
              <div key={j} className={`fu-dot${j < step ? ' done' : j === step ? ' cur' : ''}`}></div>
            ))}
          </div>
          <div className="fu-eyebrow">
            Question {step + 1} of {questions.length}
          </div>
          <div className="fu-q">{questions[step]}</div>
          <textarea
            key={step}
            className="fu-textarea"
            placeholder="Type your answer…"
            value={session.followUps[step]}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
          <div className="fu-nav">
            <button
              className="btn btn-secondary"
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
              onClick={() => setStep((s) => s - 1)}
            >
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}>
              {isLast ? 'Finish & Review →' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
