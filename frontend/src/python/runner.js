// Main-thread wrapper around pyWorker.js.
// A runaway loop can't be interrupted inside Pyodide, so on timeout the whole
// worker is terminated and a fresh one is started on the next run.

const RUN_TIMEOUT_MS = 5000
const LOAD_TIMEOUT_MS = 90000

let worker = null
let readyPromise = null
let seq = 0
const pending = new Map()

function killWorker(reason) {
  if (worker) worker.terminate()
  worker = null
  readyPromise = null
  for (const resolve of pending.values()) resolve({ error: reason })
  pending.clear()
}

function startWorker() {
  worker = new Worker(new URL('./pyWorker.js', import.meta.url))
  const p = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('The Python runtime took too long to load.')), LOAD_TIMEOUT_MS)
    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'ready') {
        clearTimeout(timer)
        resolve()
      } else if (msg.type === 'load-error') {
        clearTimeout(timer)
        reject(new Error(msg.error))
      } else if (msg.type === 'result') {
        const done = pending.get(msg.id)
        pending.delete(msg.id)
        done?.(msg)
      }
    }
    worker.onerror = (e) => {
      clearTimeout(timer)
      reject(new Error(e.message || 'The Python worker crashed.'))
    }
  })
  // A failed load leaves no worker behind, so the next call retries from scratch.
  p.catch((err) => {
    if (readyPromise === p) killWorker(err.message)
  })
  readyPromise = p
  return p
}

/** Start downloading Pyodide early (it is ~10 MB on first load, then cached by the browser). */
export function preloadPython() {
  return readyPromise ?? startWorker()
}

/**
 * Run `fnName` from `code` against `tests`.
 * Resolves to {results: [{name, passed, expected, got, error?, stdout}]} or {error}.
 * Never rejects.
 */
export async function runPythonTests({ code, fnName, tests }) {
  try {
    await preloadPython()
  } catch (err) {
    return { error: err.message }
  }
  const id = ++seq
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      killWorker('Python worker restarted.')
      resolve({ error: `Timed out after ${RUN_TIMEOUT_MS / 1000}s. Check for an infinite loop.` })
    }, RUN_TIMEOUT_MS)
    pending.set(id, (msg) => {
      clearTimeout(timer)
      resolve(msg)
    })
    worker.postMessage({ id, code, fnName, tests })
  })
}
