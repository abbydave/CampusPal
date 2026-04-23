import { useState, useEffect, useRef } from 'react'
import ThinkingBlock from './ThinkingBlock'
import RenderText from './RenderText'
import DocCard from './DocCard'
import { GREETING_RESPONSE, SCRIPT } from '../data/script'

export default function Chat({ onLogout }) {
  const [messages, setMessages] = useState([])
  const [started, setStarted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputLocked, setInputLocked] = useState(false)   // locked = user cannot send
  const [autoMode, setAutoMode] = useState(false)          // auto-typing in progress
  const bottomRef = useRef(null)
  const playingRef = useRef(false)
  const autoModeRef = useRef(false)                        // ref mirror for autoMode (no re-render lag)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── STATE HELPERS ─────────────────────────────────────────

  function addMsg(msg) {
    setMessages(prev => [...prev, msg])
  }

  function patchMsg(id, patch) {
    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m
      const updates = typeof patch === 'function' ? patch(m) : patch
      return { ...m, ...updates }
    }))
  }

  // ── AUTO-TYPE INTO INPUT FIELD ────────────────────────────

  async function typeIntoInput(text) {
    autoModeRef.current = true
    setAutoMode(true)
    setInputLocked(false)     // un-disable so the textarea renders normally
    setInputValue('')
    textareaRef.current?.focus()

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]

      // Very uneven — bursts, pauses, slow stretches
      let ms = 55 + Math.random() * 80          // base 55–135 ms

      if (ch === ',' || ch === ';') ms += 90 + Math.random() * 90
      if (ch === '.' || ch === '?') ms += 130 + Math.random() * 120
      if (ch === "'")               ms += 40
      if (ch === ' ') {
        // occasional mid-sentence pause (thinking)
        if (Math.random() > 0.80) ms += 150 + Math.random() * 260
      }
      // Rare burst of fast keys
      if (Math.random() > 0.91)    ms = 18 + Math.random() * 22
      // Rare "hesitation" stall
      if (Math.random() > 0.96)    ms += 400 + Math.random() * 300

      await sleep(ms)
      setInputValue(prev => prev + ch)
    }

    // Brief pause before "pressing Enter"
    await sleep(280 + Math.random() * 320)
  }

  // "Press Enter" — clears input, adds bubble, locks input
  async function autoEnter(text, id) {
    setInputValue('')
    addMsg({ id, role: 'user', text })
    autoModeRef.current = false
    setAutoMode(false)
    setInputLocked(true)
    await sleep(380)
  }

  // ── STREAM AI RESPONSE ────────────────────────────────────

  async function streamAI(id, fullText) {
    for (let i = 0; i < fullText.length; i++) {
      let ms = 7 + Math.random() * 16
      if (fullText[i] === '\n') ms += 18
      await sleep(ms)
      patchMsg(id, m => ({ streamedText: (m.streamedText || '') + fullText[i] }))
    }
    patchMsg(id, () => ({ showCursor: false }))
  }

  // ── THINKING STEPS ────────────────────────────────────────

  async function runSteps(id, steps) {
    for (let i = 1; i <= steps.length; i++) {
      await sleep(480 + Math.random() * 750)
      patchMsg(id, () => ({ visibleSteps: i }))
    }
    await sleep(320)
    patchMsg(id, () => ({ thinkingDone: true }))
    await sleep(280)
  }

  // ── MAIN PLAY LOOP ────────────────────────────────────────

  async function playScript() {
    if (playingRef.current) return
    playingRef.current = true

    for (const entry of SCRIPT) {
      await sleep(420)

      if (entry.type === 'user') {
        await typeIntoInput(entry.text)
        await autoEnter(entry.text, `u-${entry.id}`)

      } else if (entry.type === 'ai') {
        const waitId = `w-${entry.id}`
        addMsg({ id: waitId, role: 'ai-waiting' })
        await sleep(750 + Math.random() * 650)
        patchMsg(waitId, () => ({ hidden: true }))

        const aiId = `a-${entry.id}`
        addMsg({ id: aiId, role: 'ai', streamedText: '', showCursor: true })
        await streamAI(aiId, entry.text)
        await sleep(520)

      } else if (entry.type === 'ai_thinking') {
        const thinkId = `t-${entry.id}`
        addMsg({ id: thinkId, role: 'ai-thinking', steps: entry.steps, visibleSteps: 1, thinkingDone: false })
        await runSteps(thinkId, entry.steps)

        if (entry.clarificationText) {
          const clarId = `c-${entry.id}`
          addMsg({ id: clarId, role: 'ai', streamedText: '', showCursor: true })
          await streamAI(clarId, entry.clarificationText)
          await sleep(550)
        }

        if (!entry.clarificationText && entry.finalText) {
          const finId = `f-${entry.id}`
          addMsg({ id: finId, role: 'ai', streamedText: '', showCursor: true, hasDocs: !!entry.hasDocs })
          await streamAI(finId, entry.finalText)
          if (entry.hasDocs) patchMsg(finId, () => ({ showDocs: true }))
          await sleep(550)
        }
      }
    }

    playingRef.current = false
    setInputLocked(false)
  }

  // ── GREETING (user-initiated) ─────────────────────────────

  async function kickOff(text) {
    setInputLocked(true)
    setStarted(true)

    addMsg({ id: 'u-greeting', role: 'user', text })
    await sleep(480)

    const waitId = 'w-greeting'
    addMsg({ id: waitId, role: 'ai-waiting' })
    await sleep(1050 + Math.random() * 400)
    patchMsg(waitId, () => ({ hidden: true }))

    const greetId = 'a-greeting'
    addMsg({ id: greetId, role: 'ai', streamedText: '', showCursor: true })
    await streamAI(greetId, GREETING_RESPONSE)
    await sleep(680)

    playScript()
  }

  // ── SEND HANDLER (manual, first message only) ─────────────

  function handleSend() {
    const text = inputValue.trim()
    if (!text || inputLocked || autoModeRef.current) return
    setInputValue('')
    if (!started) kickOff(text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e) {
    // block user edits while auto-typing
    if (autoModeRef.current) return
    setInputValue(e.target.value)
  }

  // ── RENDER ────────────────────────────────────────────────

  function renderMsg(msg) {
    if (msg.hidden) return null

    if (msg.role === 'ai-waiting') {
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <div className="ai-typing-indicator"><span /><span /><span /></div>
          </div>
        </div>
      )
    }

    if (msg.role === 'ai-thinking') {
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <ThinkingBlock steps={msg.steps} visibleCount={msg.visibleSteps || 1} isDone={msg.thinkingDone} />
          </div>
        </div>
      )
    }

    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="message-row user">
          <div className="message-avatar user-avatar">A</div>
          <div className="message-content">
            <div className="message-bubble">{msg.text}</div>
          </div>
        </div>
      )
    }

    if (msg.role === 'ai') {
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <div className="message-bubble">
              <RenderText text={msg.streamedText || ''} />
              {msg.showCursor && <span className="typing-cursor" />}
            </div>
            {msg.showDocs && <DocCard visible />}
          </div>
        </div>
      )
    }

    return null
  }

  const isTextareaDisabled = inputLocked && !autoMode

  return (
    <div className="chat-layout">
      <header className="chat-header">
        <div className="header-left">
          <div className="header-logo-mark">C</div>
          <span className="header-name">CampusPal</span>
        </div>
        <div className="header-right">
          <span className="header-welcome">Welcome, <span>Abigail</span></span>
          <button className="logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="messages-area">
        <div className="messages-inner">
          {messages.length === 0 && (
            <div className="welcome-state">
              <div className="welcome-icon">🎓</div>
              <h2 className="welcome-heading">Hi Abigail, I'm CampusPal</h2>
              <p className="welcome-sub">
                Your personal academic assistant for UNILAG. Ask me anything about your courses, CGPA, portal, or academic policies.
              </p>
            </div>
          )}
          {messages.map(renderMsg)}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="input-inner">
          <textarea
            ref={textareaRef}
            className="input-box"
            placeholder="Message CampusPal…"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isTextareaDisabled}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || inputLocked || autoMode}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
