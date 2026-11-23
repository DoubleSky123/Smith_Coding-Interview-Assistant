export default function Setup({ task, onStart }) {
  return (
    <div id="scr-setup">
      <div className="setup-wrap">
        <div className="smith-mark">
          <div className="smith-icon">S&gt;</div>
          <div className="smith-name">
            Smith<em>.</em>
          </div>
        </div>
        <div className="smith-sub">AI-assisted coding interview practice</div>

        <div className="task-card">
          <div className="task-card-top">
            <div className="task-card-title">{task.title}</div>
            <div className="task-badges">
              <span className="badge badge-blue">{task.category}</span>
              <span className="badge badge-orange">{task.difficulty}</span>
              <span className="badge badge-green">{task.time_limit_sec / 60} min</span>
            </div>
          </div>
          <p className="task-desc">{task.summary}</p>
          <div className="task-meta">
            <div>
              <strong>Type:</strong> {task.category}
            </div>
            <div>
              <strong>Language:</strong> {task.language}
            </div>
            <div>
              <strong>Time limit:</strong> {task.time_limit_sec / 60} minutes
            </div>
            <div>
              <strong>Demo tests:</strong> {task.tests.length} cases
            </div>
          </div>
        </div>

        <div className="ai-notice">
          <div className="ai-notice-icon">✦</div>
          <div>
            <strong style={{ color: 'var(--acc)' }}>AI assistance is explicitly allowed.</strong> Use the AI Coding
            Assistant and AI Interviewer throughout the session. Focus on understanding and verifying your solution —
            you&apos;ll be asked to explain decisions and reflect on AI use in the follow-up.
          </div>
        </div>

        <div className="setup-cta">
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            Start Interview →
          </button>
        </div>
      </div>
    </div>
  )
}
