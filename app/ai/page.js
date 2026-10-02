'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/cerca/ui-kit'
import { Sparkles, Send, Loader2, AlertTriangle, BookOpen, RotateCcw } from 'lucide-react'

const PROMPTS = [
  'How can I teach Milo not to pull on the leash?',
  'How often should I mentally stimulate my dog?',
  'How can I introduce a new cat to my dog?',
  'What should I prepare before adopting a kitten?',
]

const GREETING = {
  role: 'assistant',
  id: 'greeting',
  content:
    "Hi Mia 👋 I'm Cerca AI. Ask me about training, behaviour, everyday care, nutrition basics, or life with Milo.",
  sources: [],
  greeting: true,
}

export default function AiPage() {
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  // session + history
  useEffect(() => {
    let sid = null
    try {
      sid = window.localStorage.getItem('cerca_ai_session')
    } catch {}
    if (!sid) {
      sid = `s-${Math.random().toString(36).slice(2, 10)}`
      try { window.localStorage.setItem('cerca_ai_session', sid) } catch {}
    }
    setSessionId(sid)
    fetch(`/api/ai/messages?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length) setMessages([GREETING, ...d.messages])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  const send = useCallback(
    async (text) => {
      const question = (text ?? input).trim()
      if (!question || busy || !sessionId) return
      setInput('')
      setError('')
      setBusy(true)
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', content: question }])
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, message: question }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Cerca AI could not answer right now.')
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.answer,
            sources: data.sources || [],
            emergency: data.emergency,
          },
        ])
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy(false)
      }
    },
    [input, busy, sessionId]
  )

  const newChat = () => {
    const sid = `s-${Math.random().toString(36).slice(2, 10)}`
    try { window.localStorage.setItem('cerca_ai_session', sid) } catch {}
    setSessionId(sid)
    setMessages([GREETING])
    setError('')
  }

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        eyebrow="Cerca AI"
        title="Ask Cerca"
        subtitle="Your companion for training, behaviour, everyday care and nutrition basics."
        action={
          <Button variant="secondary" size="sm" className="press rounded-full" onClick={newChat} data-testid="new-chat">
            <RotateCcw className="mr-1.5 h-4 w-4" /> New chat
          </Button>
        }
      />

      <Card className="flex flex-col overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold leading-tight">Cerca AI</p>
            <p className="text-xs text-muted-foreground">Educational guidance · not a veterinarian</p>
          </div>
        </div>

        <div className="min-h-[46vh] space-y-4 px-4 py-5 sm:px-5" data-testid="chat-messages">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="space-y-2" data-testid={m.emergency ? 'answer-emergency' : 'answer'}>
                <div
                  className={`max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed ${
                    m.emergency ? 'border border-lost/40 bg-lost-soft' : 'bg-muted'
                  }`}
                >
                  {m.emergency ? (
                    <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-lost">
                      <AlertTriangle className="h-4 w-4" /> Urgent · see a vet now
                    </p>
                  ) : null}
                  {m.content}
                </div>
                {m.sources?.length ? (
                  <div className="flex flex-wrap items-center gap-1.5 pl-1" data-testid="sources">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" /> Sources
                    </span>
                    {m.sources.map((s) => (
                      <span key={s.id || s.title} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold">
                        {s.title || s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          )}

          {busy ? (
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground" data-testid="thinking">
              <Loader2 className="h-4 w-4 animate-spin" /> Cerca AI is thinking…
            </div>
          ) : null}

          {messages.length <= 1 && !busy ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  data-testid="suggested-prompt"
                  className="press max-w-full rounded-full border border-border bg-card px-3.5 py-2 text-left text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-lost-soft px-4 py-3 text-sm font-medium text-lost" data-testid="chat-error">{error}</p>
          ) : null}

          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card px-4 py-3">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <Input
              className="rounded-full"
              placeholder="Ask about training, behaviour, care…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              data-testid="chat-input"
            />
            <Button type="submit" size="icon" className="press shrink-0 rounded-full" disabled={busy || !input.trim()} data-testid="chat-send" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Cerca AI gives general guidance and cannot replace a veterinarian.
          </p>
        </div>
      </Card>
    </div>
  )
}
