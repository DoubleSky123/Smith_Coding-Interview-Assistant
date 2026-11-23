import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Colors come from the CSS variables in styles.css, so light/dark theme switching just works.
const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--bg)', color: 'var(--fg)', fontSize: '13px' },
  '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.65' },
  '.cm-content': { caretColor: 'var(--acc)', padding: '12px 0' },
  '.cm-gutters': {
    backgroundColor: 'var(--surf)',
    color: 'var(--fg3)',
    border: 'none',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(0,255,65,.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--surf2)', color: 'var(--fg2)' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--acc)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
    { backgroundColor: 'rgba(63,185,80,.25)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--surf3)', outline: '1px solid var(--border)' },
})

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.moduleKeyword, t.self], color: 'var(--acc)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--warn)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--info)' },
  { tag: [t.comment, t.lineComment], color: 'var(--fg3)', fontStyle: 'italic' },
  { tag: [t.function(t.definition(t.variableName)), t.definition(t.className)], fontWeight: '600' },
  { tag: t.propertyName, color: 'var(--fg2)' },
])

const extensions = [
  python(),
  indentUnit.of('    '),
  syntaxHighlighting(highlight),
  EditorView.contentAttributes.of({ 'aria-label': 'Python code editor' }),
]

export default function CodeEditor({ value, onChange }) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={theme}
      extensions={extensions}
      height="100%"
      // No autocomplete popups: closer to typical interview conditions.
      basicSetup={{ tabSize: 4, autocompletion: false }}
    />
  )
}
