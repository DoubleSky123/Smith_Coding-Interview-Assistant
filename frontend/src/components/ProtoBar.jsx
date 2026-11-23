import { useEffect, useState } from 'react'

function initialTheme() {
  try {
    const saved = localStorage.getItem('smith-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function ProtoBar({ health }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('smith-theme', next)
    } catch {
      /* storage unavailable */
    }
  }

  let aiLabel = 'AI: connecting…'
  if (health?.ai_mode === 'live') aiLabel = `AI: live (${health.model})`
  else if (health?.ai_mode === 'scripted') aiLabel = 'AI: scripted replies (add ANTHROPIC_API_KEY to backend/.env for live AI)'

  return (
    <div id="proto-bar">
      <span>
        <b>⚑ Smith dev build</b> — {aiLabel} · Tests run real Python in your browser.
      </span>
      <button id="theme-toggle" onClick={toggle}>
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button>
    </div>
  )
}
