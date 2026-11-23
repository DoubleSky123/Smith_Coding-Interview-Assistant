/* Classic Web Worker that runs candidate code with Pyodide (CPython compiled to WebAssembly).
   Running in the browser means no candidate code ever executes on the server. */

// 0.29.x (Python 3.13). The newer 314.x line fails to load via importScripts in a classic worker.
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.5/full/pyodide.js'

// Executes the candidate's code in a fresh namespace, then calls the target
// function once per test. Returns a JSON string: {results: [...]} or {error}.
const HARNESS = `
import json, io, contextlib, traceback, copy

def _smith_err(e):
    line = None
    for frame in traceback.extract_tb(e.__traceback__):
        if frame.filename == "solution.py":
            line = frame.lineno
    where = f" (line {line})" if line else ""
    return f"{type(e).__name__}: {e}{where}"

def _smith_run():
    tests = json.loads(_smith_tests)
    ns = {"__name__": "solution"}
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(_smith_code, "solution.py", "exec"), ns)
    except SyntaxError as e:
        return json.dumps({"error": f"{type(e).__name__}: {e.msg} (line {e.lineno})"})
    except BaseException as e:
        return json.dumps({"error": _smith_err(e)})
    fn = ns.get(_smith_fn)
    if not callable(fn):
        return json.dumps({"error": f"Function {_smith_fn}() is not defined in your code."})
    results = []
    for t in tests:
        buf = io.StringIO()
        r = {"name": t["name"], "expected": repr(t["expected"]), "got": None, "passed": False}
        try:
            with contextlib.redirect_stdout(buf):
                got = fn(*copy.deepcopy(t["args"]))
            r["got"] = repr(got)
            r["passed"] = bool(got == t["expected"])
        except BaseException as e:
            r["error"] = _smith_err(e)
        r["stdout"] = buf.getvalue()[-2000:]
        results.append(r)
    return json.dumps({"results": results})

_smith_run()
`

let ready
try {
  importScripts(PYODIDE_URL)
  ready = self.loadPyodide().then(
    (py) => {
      self.postMessage({ type: 'ready' })
      return py
    },
    (err) => {
      self.postMessage({ type: 'load-error', error: `Could not start the Python runtime: ${err.message}` })
      throw err
    },
  )
} catch (err) {
  self.postMessage({
    type: 'load-error',
    error: `Could not download the Python runtime (Pyodide). Check your internet connection. (${err.message})`,
  })
}

self.onmessage = async (e) => {
  const { id, code, fnName, tests } = e.data
  try {
    const py = await ready
    py.globals.set('_smith_code', code)
    py.globals.set('_smith_fn', fnName)
    py.globals.set('_smith_tests', JSON.stringify(tests))
    const out = py.runPython(HARNESS)
    self.postMessage({ type: 'result', id, ...JSON.parse(out) })
  } catch (err) {
    self.postMessage({ type: 'result', id, error: String(err?.message || err) })
  }
}
