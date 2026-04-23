import { useState, useEffect, useRef, useCallback } from 'react'
import ThinkingBlock from './ThinkingBlock'
import RenderText from './RenderText'
import DocCard from './DocCard'
import { GREETING_RESPONSE, SCRIPT } from '../data/script'

const SECTION_CLASSES = {
  'Knowledge Brain': 'rag',
  'CGPA Simulator': 'cgpa',
  'Portal Navigator': 'mcp',
}

// Realistic per-character delay with some variation
function charDelay(base = 38) {
  return base + Math.random() * 30 - 10
}

// Pause occasionally to simulate thinking while typing
function shouldPause(i, text) {
  const ch = text[i]
  if (ch === ',' || ch === '.') return Math.random() > 0.5 ? 120 : 0
  if (ch === ' ' && Math.random() > 0.95) return 200
  return 0
}

export default function Chat({ onLogout }) {
  const [messages, setMessages] = useState([])
  // playState: 'idle' | 'playing' | 'done'
  const [playState, setPlayState] = useState('idle')
  const [inputValue, setInputValue] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)
  const bottomRef = useRef(null)
  const playingRef = useRef(false)
  const abortRef = useRef(false)
  const textareaRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── HELPERS ──────────────────────────────────────────────

  function addMessage(msg) {
    setMessages(prev => [...prev, msg])
    return msg.id
  }

  function updateMessage(id, updater) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updater(m) } : m))
  }

  // Type out text character by character into a message's `streamedText`
  async function streamText(id, fullText, baseDelay = 12) {
    for (let i = 0; i < fullText.length; i++) {
      if (abortRef.current) return
      await sleep(charDelay(baseDelay) + shouldPause(i, fullText))
      updateMessage(id, m => ({ streamedText: (m.streamedText || '') + fullText[i], showCursor: true }))
    }
    updateMessage(id, m => ({ showCursor: false, done: true }))
  }

  // Simulate user typing into a message
  async function simulateUserTyping(id, text) {
    for (let i = 0; i < text.length; i++) {
      if (abortRef.current) return
      await sleep(charDelay(55) + shouldPause(i, text))
      updateMessage(id, m => ({ streamedText: (m.streamedText || '') + text[i], showCursor: true }))
    }
    updateMessage(id, m => ({ showCursor: false, done: true }))
    await sleep(350)
  }

  // Run thinking steps one by one
  async function runThinkingSteps(id, steps) {
    for (let i = 1; i <= steps.length; i++) {
      if (abortRef.current) return
      const delay = 600 + Math.random() * 700
      await sleep(delay)
      updateMessage(id, () => ({ visibleSteps: i }))
    }
    await sleep(400)
    updateMessage(id, () => ({ thinkingDone: true }))
    await sleep(300)
  }

  // ── PLAY LOOP ─────────────────────────────────────────────

  async function playScript() {
    if (playingRef.current) return
    playingRef.current = true
    abortRef.current = false

    let lastSection = null

    for (const entry of SCRIPT) {
      if (abortRef.current) break
      await sleep(500)

      if (entry.type === 'user') {
        const id = `msg-${entry.id}`
        addMessage({ id, role: 'user', streamedText: '', showCursor: true })
        await simulateUserTyping(id, entry.text)

      } else if (entry.type === 'ai') {
        // Section divider
        if (entry.section && entry.section !== lastSection) {
          await sleep(300)
          addMessage({ id: `div-${entry.id}`, role: 'divider', section: entry.section })
          lastSection = entry.section
          await sleep(400)
        }

        // Typing indicator
        const waitId = `wait-${entry.id}`
        addMessage({ id: waitId, role: 'ai-waiting' })
        await sleep(900 + Math.random() * 600)
        updateMessage(waitId, () => ({ role: 'ai-hidden' }))

        const id = `msg-${entry.id}`
        addMessage({ id, role: 'ai', streamedText: '', showCursor: true })
        await streamText(id, entry.text)
        await sleep(600)

      } else if (entry.type === 'ai_thinking') {
        // Section divider
        if (entry.section && entry.section !== lastSection) {
          await sleep(300)
          addMessage({ id: `div-${entry.id}`, role: 'divider', section: entry.section })
          lastSection = entry.section
          await sleep(400)
        }

        // Thinking block message
        const thinkId = `think-${entry.id}`
        addMessage({
          id: thinkId,
          role: 'ai-thinking',
          steps: entry.steps,
          visibleSteps: 1,
          thinkingDone: false,
        })
        await runThinkingSteps(thinkId, entry.steps)

        // If there's a clarification (ask user to choose electives, etc.)
        if (entry.clarificationText) {
          const clarId = `clar-${entry.id}`
          addMessage({ id: clarId, role: 'ai', streamedText: '', showCursor: true })
          await streamText(clarId, entry.clarificationText)
          await sleep(600)
          // Pause — wait for the simulated user reply which is the NEXT script entry
        }

        // If no clarification but has finalText, stream it now
        if (!entry.clarificationText && entry.finalText) {
          const finId = `final-${entry.id}`
          addMessage({ id: finId, role: 'ai', streamedText: '', showCursor: true, hasDocs: entry.hasDocs })
          await streamText(finId, entry.finalText)
          if (entry.hasDocs) {
            updateMessage(finId, () => ({ showDocs: true }))
          }
          await sleep(600)
        }

        // If there IS a clarification but the finalText comes from the NEXT clarify_ai entry, skip here
      }
    }

    playingRef.current = false
    setPlayState('done')
    setInputDisabled(false)
  }

  // ── GREETING HANDLER ─────────────────────────────────────

  async function handleGreeting(text) {
    setInputDisabled(true)
    setPlayState('playing')

    // Show user message
    const userId = 'msg-greeting-user'
    addMessage({ id: userId, role: 'user', streamedText: text, done: true, showCursor: false })
    await sleep(600)

    // Show waiting indicator
    const waitId = 'wait-greeting'
    addMessage({ id: waitId, role: 'ai-waiting' })
    await sleep(1200)
    updateMessage(waitId, () => ({ role: 'ai-hidden' }))

    // Stream greeting response
    const greetId = 'msg-greeting-ai'
    addMessage({ id: greetId, role: 'ai', streamedText: '', showCursor: true })
    await streamText(greetId, GREETING_RESPONSE, 14)
    await sleep(800)

    // Now auto-play the full script
    playScript()
  }

  // ── SEND HANDLER ─────────────────────────────────────────

  function handleSend() {
    const text = inputValue.trim()
    if (!text || inputDisabled) return
    setInputValue('')

    if (playState === 'idle') {
      handleGreeting(text)
    }
    // After the demo is running, input is disabled
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── RENDER HELPERS ───────────────────────────────────────

  function renderMessage(msg) {
    if (msg.role === 'ai-hidden') return null

    if (msg.role === 'divider') {
      const cls = SECTION_CLASSES[msg.section] || ''
      return (
        <div key={msg.id} className={`section-divider ${cls}`}>
          <div className="section-divider-line" />
          <div className="section-divider-label">{msg.section}</div>
          <div className="section-divider-line" />
        </div>
      )
    }

    if (msg.role === 'ai-waiting') {
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <div className="ai-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )
    }

    if (msg.role === 'ai-thinking') {
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <ThinkingBlock
              steps={msg.steps}
              visibleCount={msg.visibleSteps || 1}
              isDone={msg.thinkingDone}
            />
          </div>
        </div>
      )
    }

    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="message-row user">
          <div className="message-avatar user-avatar">A</div>
          <div className="message-content">
            <div className="message-bubble">
              {msg.streamedText || ''}
              {msg.showCursor && <span className="typing-cursor" />}
            </div>
          </div>
        </div>
      )
    }

    if (msg.role === 'ai') {
      const text = msg.streamedText || ''
      return (
        <div key={msg.id} className="message-row ai">
          <div className="message-avatar ai-avatar">C</div>
          <div className="message-content">
            <div className="message-bubble">
              <RenderText text={text} />
              {msg.showCursor && <span className="typing-cursor" />}
            </div>
            {msg.showDocs && <DocCard visible />}
          </div>
        </div>
      )
    }

    return null
  }

  const showWelcome = messages.length === 0

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
          {showWelcome && (
            <div className="welcome-state">
              <div className="welcome-icon">🎓</div>
              <h2 className="welcome-heading">Hi Abigail, I'm CampusPal</h2>
              <p className="welcome-sub">
                Your personal AI assistant for UNILAG. Say hi to get started — I'll help with course registration, CGPA planning, and portal tasks.
              </p>
            </div>
          )}
          {messages.map(renderMessage)}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="input-inner">
          <textarea
            ref={textareaRef}
            className="input-box"
            placeholder={inputDisabled ? 'Demo is running…' : 'Say hi to start the demo…'}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={inputDisabled}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={inputDisabled || !inputValue.trim()}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="input-hint">
          {playState === 'idle' && 'Type a greeting to begin the demo'}
          {playState === 'playing' && 'Demo in progress — sit back and watch'}
          {playState === 'done' && 'Demo complete — refresh to restart'}
        </div>
      </div>
    </div>
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
