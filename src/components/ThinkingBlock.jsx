import { useState } from 'react'

export default function ThinkingBlock({ steps, visibleCount, isDone }) {
  const [open, setOpen] = useState(true)
  const shown = steps.slice(0, visibleCount)

  return (
    <div className="thinking-block">
      <div className="thinking-header" onClick={() => setOpen(o => !o)}>
        <div className={`thinking-spinner${isDone ? ' done' : ''}`} />
        <span className="thinking-label">
          {isDone ? 'Done thinking' : 'Working on it…'}
        </span>
        <span className={`thinking-chevron${open ? ' open' : ''}`}>▼</span>
      </div>

      {open && (
        <div className="thinking-steps">
          {shown.map((step, i) => {
            const isLast = i === visibleCount - 1 && !isDone
            return (
              <div
                key={i}
                className={`thinking-step ${isLast ? 'active' : 'done'}`}
              >
                <div className="thinking-step-dot" />
                <span>{step}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
