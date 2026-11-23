import { useEffect, useState } from 'react'
import ChatPanel from '../components/ChatPanel.jsx'
import CodeEditor from '../components/CodeEditor.jsx'
import TestPanel from '../components/TestPanel.jsx'
import { api } from '../lib/api.js'
import { formatClock, summarizeRun } from '../lib/feedback.js'
import RichText from '../lib/RichText.jsx'
import { preloadPython, runPythonTests } from '../python/runner.js'

const TIME_UP =
  'Time\'s up. Use the "Finish Coding" button to move on. We\'ll review whatever you have now.'

const nowIso = () => new Date().toISOString()

function appendMsg(session, key, msg) {
  return { ...session, chats: { ...session.chats, [key]: [...session.chats[key], msg] } }
}

async function runOnce(task, code) {
  const { results, error } = await runPythonTests({ code, fnName: task.function_name, tests: task.tests })
  return { at: nowIso(), code, results, error }
}

export default function Workspace({ task, session, setSession, onFinish }) {
  const [now, setNow] = useState(Date.now())
  const [taskOpen, setTaskOpen] = useState(true)
  const [testsOpen, setTestsOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [tab, setTab] = useState('iv')
  const [pending, setPending] = useState({ iv: false, ca: false })

  const secsLeft = Math.max(0, task.time_limit_sec - Math.floor((now - session.startedAt) / 1000))
  const lastRun = session.testRuns.at(-1) ?? null

  // Start downloading Pyodide right away so the first test run is fast.
  useEffect(() => {
    preloadPython().catch(() => {})
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secsLeft === 0 && !session.timeUpNotified) {
      setSession((s) =>
        s.timeUpNotified
          ? s
          : { ...appendMsg(s, 'iv', { role: 'assistant', content: TIME_UP, at: nowIso() }), timeUpNotified: true },
      )
    }
  }, [secsLeft, session.timeUpNotified, setSession])

  async function runTests() {
    if (running) return
    setRunning(true)
    setTestsOpen(true)
    const run = await runOnce(task, session.code)
    setSession((s) => ({ ...s, testRuns: [...s.testRuns, run] }))
    setRunning(false)
  }

  async function send(key, text) {
    const userMsg = { role: 'user', content: text, at: nowIso() }
    const history = [...session.chats[key].filter((m) => !m.error), userMsg]
    setSession((s) => appendMsg(s, key, userMsg))
    setPending((p) => ({ ...p, [key]: true }))
    try {
      const res = await api.chat({
        task_id: task.id,
        role: key === 'iv' ? 'interviewer' : 'assistant',
        messages: history.map(({ role, content }) => ({ role, content })),
        code: session.code,
        seconds_left: secsLeft,
        test_summary: summarizeRun(lastRun),
      })
      setSession((s) => appendMsg(s, key, { role: 'assistant', content: res.reply, at: nowIso(), source: res.source }))
    } catch (err) {
      setSession((s) => appendMsg(s, key, { role: 'assistant', content: err.message, at: nowIso(), error: true }))
    } finally {
      setPending((p) => ({ ...p, [key]: false }))
    }
  }

  async function finish() {
    setFinishing(true)
    const endedAt = Date.now()
    // Grade the code as submitted (not counted as one of the candidate's own test runs).
    const finalRun = await runOnce(task, session.code)
    onFinish({ endedAt, finalRun })
  }

  const timerClass = 'ws-timer' + (secsLeft <= 60 ? ' urgent' : secsLeft <= 300 ? ' warn' : '')

  return (
    <div id="scr-workspace">
      <div className="topbar">
        <div className="topbar-brand">
          Smith<em>.</em>
        </div>
        <div className="topbar-sep"></div>
        <div className="topbar-stage">Coding</div>
        <div className={timerClass} role="timer" aria-label="Time remaining">
          {formatClock(secsLeft)}
        </div>
        <div className="ws-topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={runTests} disabled={running || finishing}>
            ▶ Run Demo Tests
          </button>
          <button className="btn btn-primary btn-sm" onClick={finish} disabled={finishing}>
            {finishing ? 'Checking code…' : 'Finish Coding'}
          </button>
        </div>
      </div>

      <div className="ws-body">
        <div className="ws-left">
          <div className="task-toggle-bar" onClick={() => setTaskOpen((o) => !o)}>
            <span className="task-toggle-label">📋 {task.title} — task spec</span>
            <button className="task-toggle-btn">{taskOpen ? '▾ hide' : '▸ show'}</button>
          </div>
          <div className={`task-pane${taskOpen ? '' : ' closed'}`}>
            <h4>Function signature</h4>
            <pre>
              <code>{task.signature}</code>
            </pre>
            <h4>{task.input_heading}</h4>
            <ul>
              {task.input_fields.map((f) => (
                <li key={f.name}>
                  <code>{f.name}</code> — <RichText text={f.desc} />
                </li>
              ))}
            </ul>
            <h4>Return</h4>
            <p>
              <RichText text={task.returns} />
            </p>
            <h4>Examples</h4>
            <pre>
              <code>{task.examples}</code>
            </pre>
          </div>

          <div className="editor-label">
            <span>solution.py</span>
            <span className="lang-pill">{task.language}</span>
          </div>
          <div className="code-wrap">
            <CodeEditor value={session.code} onChange={(code) => setSession((s) => ({ ...s, code }))} />
          </div>

          <TestPanel
            run={lastRun}
            running={running}
            open={testsOpen}
            onToggle={() => setTestsOpen((o) => !o)}
            onRun={runTests}
          />
        </div>

        <div className="ws-right">
          <div className="ai-tabs" role="tablist">
            <button className={`ai-tab${tab === 'iv' ? ' on' : ''}`} role="tab" onClick={() => setTab('iv')}>
              <div className="ai-tab-dot"></div>AI Interviewer
            </button>
            <button className={`ai-tab${tab === 'ca' ? ' on' : ''}`} role="tab" onClick={() => setTab('ca')}>
              <div className="ai-tab-dot"></div>AI Coding Assistant
            </button>
          </div>
          {/* Both panels stay mounted so drafts and scroll position survive tab switches. */}
          <ChatPanel
            title="AI Interviewer"
            messages={session.chats.iv}
            pending={pending.iv}
            onSend={(text) => send('iv', text)}
            placeholder="Ask the interviewer…"
            hidden={tab !== 'iv'}
          />
          <ChatPanel
            title="AI Coding Assistant"
            messages={session.chats.ca}
            pending={pending.ca}
            onSend={(text) => send('ca', text)}
            placeholder="Ask for coding help…"
            hidden={tab !== 'ca'}
          />
        </div>
      </div>
    </div>
  )
}
