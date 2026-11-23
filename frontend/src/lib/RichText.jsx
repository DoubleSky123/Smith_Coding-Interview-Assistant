// Renders the small markdown subset the AI roles are told to use:
// ```code blocks```, `inline code`, and **bold**. Builds React elements
// (never innerHTML), so model output can't inject markup.

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g

function renderInline(text) {
  return text.split(INLINE).map((part, i) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function RichText({ text }) {
  // split() with one capture group alternates: text, code, text, code, ...
  const parts = text.split(/```[\w+-]*\n?([\s\S]*?)```/g)
  const last = parts.length - 1
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <div className="msg-codeblock" key={i}>
          {part.replace(/\s+$/, '')}
        </div>
      )
    }
    // Drop the newline that sits right next to a code block; the block is already its own line.
    let segment = part
    if (i > 0) segment = segment.replace(/^\n/, '')
    if (i < last) segment = segment.replace(/\n$/, '')
    return segment ? <span key={i}>{renderInline(segment)}</span> : null
  })
}
