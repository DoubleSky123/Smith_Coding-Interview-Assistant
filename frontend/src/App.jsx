import { useEffect, useState } from 'react'
import ProtoBar from './components/ProtoBar.jsx'
import { api } from './lib/api.js'
import FollowUp from './screens/FollowUp.jsx'
import Review from './screens/Review.jsx'
import Setup from './screens/Setup.jsx'
import Workspace from './screens/Workspace.jsx'

const WELCOME =
  "Welcome. Take a moment to read through the task description — no rush. Feel free to ask clarifying questions about anything in the spec before you start coding. When you're ready, start writing in the editor."

function newSession(task) {
  return {
    startedAt: Date.now(),
    endedAt: null,
    code: task.starter_code,
    chats: { iv: [{ role: 'assistant', content: WELCOME, at: new Date().toISOString() }], ca: [] },
    testRuns: [], // candidate-initiated runs, each with a code snapshot
    finalRun: null, // automatic run on the submitted code
    followUps: task.follow_ups.map(() => ''),
    timeUpNotified: false,
  }
}

// Shape stored by POST /api/sessions for later analysis.
function toPayload(task, s, health) {
  return {
    task_id: task.id,
    started_at: new Date(s.startedAt).toISOString(),
    ended_at: new Date(s.endedAt).toISOString(),
    duration_sec: Math.round((s.endedAt - s.startedAt) / 1000),
    time_limit_sec: task.time_limit_sec,
    ai_mode: health?.ai_mode ?? null,
    model: health?.model ?? null,
    final_code: s.code,
    final_run: s.finalRun,
    test_runs: s.testRuns,
    chats: { interviewer: s.chats.iv, assistant: s.chats.ca },
    follow_ups: task.follow_ups.map((question, i) => ({ question, answer: s.followUps[i] })),
  }
}

export default function App() {
  const [health, setHealth] = useState(null)
  const [task, setTask] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [screen, setScreen] = useState('setup') // setup | workspace | followup | review
  const [session, setSession] = useState(null)
  const [saveState, setSaveState] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [h, tasks] = await Promise.all([api.health(), api.tasks()])
        if (!tasks.length) throw new Error('No tasks are defined in backend/tasks.py.')
        const t = await api.task(tasks[0].id)
        if (!cancelled) {
          setHealth(h)
          setTask(t)
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  async function finishFollowUps() {
    setScreen('review')
    setSaveState({ status: 'saving' })
    try {
      const { id } = await api.saveSession(toPayload(task, session, health))
      setSaveState({ status: 'saved', id })
    } catch (err) {
      setSaveState({ status: 'error', error: err.message })
    }
  }

  function restart() {
    setSession(null)
    setSaveState(null)
    setScreen('setup')
  }

  let content
  if (loadError) {
    content = (
      <div className="load-screen">
        {loadError}
        <br />
        Start the backend: cd backend → uvicorn main:app --reload --port 8000
      </div>
    )
  } else if (!task) {
    content = <div className="load-screen">Loading…</div>
  } else if (screen === 'setup' || !session) {
    content = (
      <Setup
        task={task}
        onStart={() => {
          setSession(newSession(task))
          setScreen('workspace')
        }}
      />
    )
  } else if (screen === 'workspace') {
    content = (
      <Workspace
        task={task}
        session={session}
        setSession={setSession}
        onFinish={({ endedAt, finalRun }) => {
          setSession((s) => ({ ...s, endedAt, finalRun }))
          setScreen('followup')
        }}
      />
    )
  } else if (screen === 'followup') {
    content = <FollowUp task={task} session={session} setSession={setSession} onDone={finishFollowUps} />
  } else {
    content = <Review task={task} session={session} saveState={saveState} onRestart={restart} />
  }

  return (
    <>
      {content}
      <ProtoBar health={health} />
    </>
  )
}
