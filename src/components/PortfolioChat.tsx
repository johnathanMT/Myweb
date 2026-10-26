import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MessageCircle, SendHorizontal, Sparkles, X } from 'lucide-react'
import { sendPortfolioMessage, type ChatMessage } from '../services/portfolioChat'

/**
 * PortfolioChat — "Ask my Portfolio": a floating AI chat in the bottom-right
 * corner, above the robot dock. State lives here; the network call (or local
 * mock) lives in services/portfolioChat.ts.
 */
const GREETING: ChatMessage = {
  role: 'assistant',
  content: 'Hi! I’m an AI assistant for Myo’s portfolio. Ask me about his skills, projects or availability.',
}
const SUGGESTIONS = ['Does he know C#?', 'What is his visa status?', 'What roles is he looking for?', 'Tell me about his AI projects']

export default function PortfolioChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, pending])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => () => abortRef.current?.abort(), [])

  // Esc closes the panel
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function ask(text: string) {
    const question = text.trim()
    if (!question || pending) return
    const history: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(history)
    setInput('')
    setPending(true)
    abortRef.current = new AbortController()
    try {
      // the greeting is UI chrome, not conversation — don't send it
      const reply = await sendPortfolioMessage(history.slice(1), abortRef.current.signal)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((m) => [...m, { role: 'assistant', content: 'Sorry — I couldn’t reach the assistant. Please try again in a moment.' }])
      }
    } finally {
      setPending(false)
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void ask(input) }

  return (
    <div className="fixed right-4 z-[46] flex flex-col items-end gap-3 sm:right-6"
      style={{ bottom: 'calc(var(--dock-space) + 0.5rem)' }}>
      {open && (
        <section
          role="dialog"
          aria-label="Ask my Portfolio"
          className="flex h-[min(32rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 shadow-2xl backdrop-blur-xl"
          style={{ background: 'rgb(var(--surface) / 0.96)' }}
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Sparkles size={15} className="text-accent" aria-hidden /> Ask my Portfolio
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat"
              className="rounded-md p-1 text-muted transition-colors hover:text-fg">
              <X size={16} aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <p key={i}
                className={m.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-sm text-white'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm leading-relaxed text-fg'}>
                {m.content}
              </p>
            ))}
            {pending && (
              <p className="w-fit rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm text-muted">
                <span className="animate-pulse">Thinking…</span>
              </p>
            )}
            {messages.length === 1 && !pending && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((q) => (
                  <li key={q}>
                    <button type="button" onClick={() => void ask(q)}
                      className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent-light transition-colors hover:bg-accent/20">
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, projects…"
              aria-label="Your question"
              maxLength={500}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-fg placeholder:text-muted/70 focus:border-accent/50 focus:outline-none"
            />
            <button type="submit" disabled={!input.trim() || pending} aria-label="Send"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white transition-opacity disabled:opacity-40">
              <SendHorizontal size={16} aria-hidden />
            </button>
          </form>
          <p className="px-3 pb-2 text-center text-[10px] text-muted/70">AI assistant — not Myo personally. Answers may be imperfect.</p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close Ask my Portfolio' : 'Open Ask my Portfolio'}
        className="grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-lg ring-1 ring-white/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light"
      >
        {open ? <X size={20} aria-hidden /> : <MessageCircle size={20} aria-hidden />}
      </button>
    </div>
  )
}
