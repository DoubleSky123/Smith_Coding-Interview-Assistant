import { useEffect, useRef, useState } from 'react'
import RichText from '../lib/RichText.jsx'

export default function ChatPanel({ title, messages, pending, onSend, placeholder, hidden }) {
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, pending, hidden])

  function send() {
    const text = draft.trim()
    if (!text || pending) return
    onSend(text)
    setDraft('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  return (
    <div className="ai-panel" hidden={hidden}>
      <div className="chat-msgs" ref={listRef} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}${m.error ? ' error' : ''}`}>
            <div className="msg-who">{m.role === 'user' ? 'You' : title}</div>
            <div className="msg-bub">
              <RichText text={m.content} />
            </div>
          </div>
        ))}
        {pending && (
          <div className="msg ai">
            <div className="msg-who">{title}</div>
            <div className="dots" aria-label={`${title} is typing`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          rows={1}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button className="send-btn" onClick={send} disabled={pending} aria-label="Send">
          ↑
        </button>
      </div>
    </div>
  )
}
