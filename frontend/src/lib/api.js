async function request(path, options = {}) {
  let res
  try {
    res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })
  } catch {
    throw new Error('Could not reach the Smith backend. Is it running on port 8000?')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (typeof body.detail === 'string') throw new Error(body.detail)
    // The Vite dev proxy answers with a bare 5xx when the backend isn't running.
    if (res.status >= 500) throw new Error(`Backend error or unreachable (${res.status}). Is it running on port 8000?`)
    throw new Error(`Request failed (${res.status})`)
  }
  return body
}

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) })

export const api = {
  health: () => request('/api/health'),
  tasks: () => request('/api/tasks'),
  task: (id) => request(`/api/tasks/${encodeURIComponent(id)}`),
  chat: (payload) => post('/api/chat', payload),
  saveSession: (session) => post('/api/sessions', session),
}
