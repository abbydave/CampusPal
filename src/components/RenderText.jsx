// Minimal markdown renderer: bold, bullet lists, numbered lists, tables, line breaks
export default function RenderText({ text }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table: starts with |
    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      elements.push(<TableBlock key={`tbl-${i}`} lines={tableLines} />)
      continue
    }

    // Bullet list item
    if (line.match(/^[•\-\*] /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[•\-\*] /)) {
        items.push(lines[i].replace(/^[•\-\*] /, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: 18, marginBottom: 10 }}>
          {items.map((it, idx) => <li key={idx}><InlineText text={it} /></li>)}
        </ul>
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: 20, marginBottom: 10 }}>
          {items.map((it, idx) => <li key={idx}><InlineText text={it} /></li>)}
        </ol>
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      i++
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} style={{ marginBottom: 10 }}>
        <InlineText text={line} />
      </p>
    )
    i++
  }

  return <div className="ai-text">{elements}</div>
}

function TableBlock({ lines }) {
  const rows = lines
    .filter(l => !l.match(/^\|[\s\-|]+\|$/))
    .map(l => l.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()))

  if (rows.length === 0) return null
  const [header, ...body] = rows

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: 13 }}>
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i} style={{ padding: '7px 12px', border: '1px solid #2a2a2a', background: '#1e1e1e', textAlign: 'left', color: '#a0a0a0', fontWeight: 600 }}>
              <InlineText text={h} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '7px 12px', border: '1px solid #2a2a2a', color: '#ececec' }}>
                <InlineText text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function InlineText({ text }) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return part
      })}
    </>
  )
}
