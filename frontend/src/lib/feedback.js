// Rule-based review feedback, carried over from the prototype but driven by
// real test results. Labeled "illustrative" in the UI.

export function passCount(run) {
  if (!run || run.error || !run.results) return null
  return run.results.filter((r) => r.passed).length
}

/** One-line summary of a test run, shown in the UI and sent to the AI roles as context. */
export function summarizeRun(run) {
  if (!run) return null
  if (run.error) return `Run failed before tests could execute: ${run.error}`
  const total = run.results.length
  const failing = run.results.filter((r) => !r.passed)
  if (!failing.length) return `${total}/${total} tests passed.`
  const details = failing
    .map((r) => `"${r.name}" expected ${r.expected}, got ${r.error ?? r.got}`)
    .join('; ')
  return `${total - failing.length}/${total} tests passed. Failing: ${details}`
}

function looksUnfinished(code) {
  return /\bTODO\b/.test(code) || !/\breturn\b/.test(code)
}

export function buildFeedback({ code, answers, testRuns, finalRun, assistantMsgs }) {
  const total = finalRun?.results?.length ?? 0
  const passed = passCount(finalRun)
  const ranTests = testRuns.length > 0
  const usedAI = assistantMsgs > 0

  let implementation
  if (looksUnfinished(code)) {
    implementation =
      'The submitted code still contains a TODO or never returns a value. Next time, focus on completing the core logic first — even a minimal working solution reveals more than a stub.'
  } else if (!finalRun || finalRun.error) {
    implementation = `Your final code couldn't be checked: ${finalRun?.error ?? 'no test result'}. Read the error and the line it points to before changing anything else.`
  } else if (passed === total) {
    implementation = `Your final code passes all ${total} demo tests. The demo tests only cover the spec's examples — consider which other valid inputs could still break it.`
  } else {
    const failing = finalRun.results.filter((r) => !r.passed).map((r) => r.name)
    implementation = `Your final code passes ${passed} of ${total} demo tests. Still failing: ${failing.join('; ')}. Trace one failing case by hand and compare it with what your code returns.`
  }

  const explanation =
    answers[0] && answers[0].trim().length > 20
      ? 'You explained how your implementation handles the scenario in question 1. In a real interview, tie the explanation to your code — name the exact step and data structure where it happens.'
      : 'Question 1 was left blank or very short. Tracing your own code on a concrete example is a core interview skill — practice it out loud or in writing.'

  let verification
  if (!ranTests) {
    verification =
      'You never ran the demo tests during coding. Running tests early — even on an incomplete implementation — surfaces structural problems before they compound.'
  } else if (answers[1] && answers[1].trim().length > 15) {
    verification =
      passed === total
        ? `You ran the tests ${testRuns.length} time${testRuns.length > 1 ? 's' : ''} and described an edge case. Consider whether there are inputs beyond the demo cases worth checking.`
        : `You ran tests and described an edge case, but the final code still fails some tests. Compare what you expected with what the code actually returns.`
  } else {
    verification = `You ran the tests ${testRuns.length} time${testRuns.length > 1 ? 's' : ''} but didn't describe an edge case in the follow-up. Showing that you thought about boundaries matters as much as passing tests.`
  }

  const aiUse = !usedAI
    ? "You didn't use the AI Coding Assistant. That's fine, but using it to check edge cases or get a second read on your approach is part of the intended workflow."
    : answers[2] && answers[2].trim().length > 15
      ? 'You reflected on your use of the assistant. The key skill is evaluating suggestions rather than accepting them wholesale — make sure you can explain every line it produced.'
      : `You sent ${assistantMsgs} message${assistantMsgs > 1 ? 's' : ''} to the assistant but didn't reflect on it in the follow-up. Practice articulating which suggestions you used and why.`

  return [
    { icon: '⬡', title: 'Implementation', body: implementation },
    { icon: '◎', title: 'Explanation', body: explanation },
    { icon: '◈', title: 'Verification', body: verification },
    { icon: '⟡', title: 'Use of AI', body: aiUse },
  ]
}

export function buildSuggestions({ code, answers, testRuns, finalRun, assistantMsgs }) {
  const total = finalRun?.results?.length ?? 0
  const passed = passCount(finalRun)
  const out = []
  if (looksUnfinished(code) || finalRun?.error) {
    out.push(
      'Practice the accumulator pattern from scratch: iterate over a list, filter by a field, and build a dict of totals. It appears in many interview problems under different guises.',
    )
  }
  if (!testRuns.length || passed !== total) {
    out.push(
      "Before submitting, trace each test case by hand. If your mental model and your code disagree, that's the most useful thing to debug — more than trying a random fix.",
    )
  }
  if (!answers[0] || answers[0].trim().length < 30) {
    out.push(
      'After solving any problem, practice a one-minute verbal walkthrough: your data structure, what you iterate over, what you check, and what you accumulate.',
    )
  }
  if (!answers[1] || answers[1].trim().length < 20) {
    out.push(
      'Before coding, name the edge cases out loud: empty input, everything filtered out, duplicate keys. Interviewers expect this before you type the first line.',
    )
  }
  out.push(
    assistantMsgs > 0
      ? 'When the assistant suggests code, resist copying it immediately. Read it, explain it back in your own words, then decide whether to use it and why.'
      : 'Try using the AI assistant to review a finished solution — ask about edge cases or simplifications — then verify every suggestion yourself before accepting it.',
  )
  out.push(
    'Try a variation: return a dict of lists (grouping orders by customer) rather than summing. Same pattern, different accumulation — a good test of whether you understand the shape of the problem.',
  )
  return out.slice(0, 4)
}

export function formatClock(secs) {
  const s = Math.max(0, secs)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
