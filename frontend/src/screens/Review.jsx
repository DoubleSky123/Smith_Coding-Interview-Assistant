import { useEffect, useRef, useState } from 'react'
import { buildFeedback, buildSuggestions, passCount } from '../lib/feedback.js'

export default function Review({ task, session, saveState, onRestart }) {
  const [confirming, setConfirming] = useState(false)
  const codeRef = useRef(null)

  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(id)
  }, [confirming])

  const elapsed = Math.round((session.endedAt - session.startedAt) / 1000)
  const assistantMsgs = session.chats.ca.filter((m) => m.role === 'user').length
  const passed = passCount(session.finalRun)
  const input = {
    code: session.code,
    answers: session.followUps,
    testRuns: session.testRuns,
    finalRun: session.finalRun,
    assistantMsgs,
  }
  const feedback = buildFeedback(input)
  const suggestions = buildSuggestions(input)

  return (
    <div id="scr-review">
      <div className="topbar">
        <div className="topbar-brand">
          Smith<em>.</em>
        </div>
        <div className="topbar-sep"></div>
        <div className="topbar-stage">Session Review</div>
      </div>
      <div className="rv-inner">
        <div className="rv-h1">Session Complete</div>
        <div className="rv-sub">
          Your practice summary. <span className="rv-pill">Illustrative feedback</span>
        </div>

        <div className="rv-stats">
          <div className="rv-stat">
            <span className="rv-num">
              {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </span>
            <div className="rv-lbl">Time elapsed</div>
          </div>
          <div className="rv-stat">
            <span className="rv-num">{assistantMsgs}</span>
            <div className="rv-lbl">Assistant messages</div>
          </div>
          <div className="rv-stat">
            <span className="rv-num">{session.testRuns.length}</span>
            <div className="rv-lbl">Test runs</div>
          </div>
          <div className="rv-stat">
            <span className="rv-num">{passed === null ? 'Error' : `${passed}/${session.finalRun.results.length}`}</span>
            <div className="rv-lbl">Final code tests</div>
          </div>
        </div>

        <div className="rv-section">
          <div className="rv-heading">Final implementation</div>
          <div className="rv-code" ref={codeRef}>
            {session.code}
          </div>
        </div>

        <div className="rv-section">
          <div className="rv-heading">Follow-up answers</div>
          {task.follow_ups.map((q, i) => (
            <div className="rv-answer" key={i}>
              <div className="rv-answer-q">{q}</div>
              <div className="rv-answer-a">
                {session.followUps[i] || <em style={{ color: 'var(--fg3)' }}>No answer provided.</em>}
              </div>
            </div>
          ))}
        </div>

        <div className="rv-section">
          <div className="rv-heading">Feedback</div>
          <div className="rv-fb-grid">
            {feedback.map((f) => (
              <div className="rv-fb" key={f.title}>
                <div className="rv-fb-title">
                  <span>{f.icon}</span>
                  {f.title}
                </div>
                <div className="rv-fb-body">{f.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rv-section">
          <div className="rv-heading">Next practice suggestions</div>
          <ul className="rv-next">
            {suggestions.map((s, i) => (
              <li key={i}>
                <span className="rv-next-n">0{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rv-actions">
          <button className="btn btn-secondary" onClick={() => codeRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Review Code
          </button>
          <button className="btn btn-danger" onClick={() => (confirming ? onRestart() : setConfirming(true))}>
            {confirming ? 'Confirm — lose session?' : 'Start New Session'}
          </button>
        </div>
        {saveState && (
          <div className={`rv-saved${saveState.status === 'error' ? ' err' : ''}`}>
            {saveState.status === 'saving' && 'Saving session…'}
            {saveState.status === 'saved' && `Session saved (id ${saveState.id}).`}
            {saveState.status === 'error' && `Session could not be saved: ${saveState.error}`}
          </div>
        )}
      </div>
    </div>
  )
}
