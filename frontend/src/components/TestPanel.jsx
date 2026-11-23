import { passCount } from '../lib/feedback.js'

export default function TestPanel({ run, running, open, onToggle, onRun }) {
  const passed = passCount(run)
  const total = run?.results?.length ?? 0

  let tally = '— not run yet'
  let tallyColor
  if (running) tally = '— running…'
  else if (run?.error) {
    tally = '— error'
    tallyColor = 'var(--err)'
  } else if (run) {
    tally = `${passed}/${total} passing`
    tallyColor = passed === total ? 'var(--acc)' : passed === 0 ? 'var(--err)' : 'var(--warn)'
  }

  return (
    <div className="test-panel">
      <div className="test-header" onClick={onToggle}>
        <div className="test-title">
          <span style={{ color: 'var(--acc)' }}>⬡</span>
          Demo Tests
          <span id="test-tally" style={{ color: tallyColor }}>
            {tally}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          disabled={running}
          onClick={(e) => {
            e.stopPropagation()
            onRun()
          }}
        >
          ▶ Run
        </button>
      </div>
      <div className={`test-results${open ? '' : ' closed'}`}>
        {running && !run && <div className="test-banner">Loading Python and running tests… (first run downloads the runtime)</div>}
        {run?.error && <div className="test-banner err">{run.error}</div>}
        {run?.results?.map((r) => (
          <div key={r.name} className={`tc ${r.passed ? 'pass' : 'fail'}`}>
            <div className="tc-icon">{r.passed ? '✓' : '✗'}</div>
            <div>
              <div className="tc-name">{r.name}</div>
              <div className="tc-row">Expected: {r.expected}</div>
              {r.error ? (
                <div className="tc-row tc-err">Error: {r.error}</div>
              ) : (
                <div className="tc-row">Got: {r.got}</div>
              )}
              {r.stdout && <div className="tc-row">stdout: {r.stdout.trimEnd()}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
