'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatDistanceToNowStrict } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, ChevronUp, CheckCircle2, Loader2 } from 'lucide-react'

const ago = (iso) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) } catch { return 'just now' }
}

export default function QuestionDetailPage() {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions/${id}`)
      const data = await res.json()
      setQuestion(data.question || null)
    } catch {}
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const voteQuestion = async () => {
    setQuestion((q) => (q ? { ...q, voted: !q.voted, votes: Math.max(0, q.votes + (q.voted ? -1 : 1)) } : q))
    try {
      const res = await fetch(`/api/questions/${id}/vote`, { method: 'POST' })
      const data = await res.json()
      if (data.question) setQuestion(data.question)
    } catch { load() }
  }

  const voteAnswer = async (aid) => {
    setQuestion((q) =>
      q
        ? {
            ...q,
            answers: q.answers.map((a) =>
              a.id === aid ? { ...a, voted: !a.voted, votes: Math.max(0, (a.votes || 0) + (a.voted ? -1 : 1)) } : a
            ),
          }
        : q
    )
    try {
      const res = await fetch(`/api/questions/${id}/answers/${aid}/vote`, { method: 'POST' })
      const data = await res.json()
      if (data.question) setQuestion(data.question)
    } catch { load() }
  }

  const submitAnswer = async () => {
    if (answer.trim().length < 5) return setError('Write a bit more so it actually helps.')
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/questions/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post your answer')
      setQuestion(data.question)
      setAnswer('')
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PlaceholderRows rows={3} />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold">This question could not be found.</p>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/community">Back to Community</Link></Button>
      </div>
    )
  }

  const answers = [...(question.answers || [])].sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0) || (b.votes || 0) - (a.votes || 0))

  return (
    <div className="animate-fade-up space-y-5">
      <Link href="/community" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-community">
        <ArrowLeft className="h-4 w-4" /> Community
      </Link>

      <Card className="rounded-3xl border-border p-5 shadow-soft sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">{question.category}</p>
        <h1 className="mt-1 text-xl font-extrabold leading-snug sm:text-2xl" data-testid="question-title">{question.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Asked by {question.author} · {ago(question.createdAt)}</p>
        {question.body ? <p className="mt-3 text-sm leading-relaxed">{question.body}</p> : null}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={voteQuestion}
            data-testid="vote-question"
            className={`press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold ${
              question.voted ? 'border-primary bg-secondary text-primary' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <ChevronUp className="h-4 w-4" /> <span data-testid="question-votes">{question.votes}</span>
          </button>
          <span className="text-sm text-muted-foreground">{answers.length} answer{answers.length === 1 ? '' : 's'}</span>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Answers</h2>
        {answers.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground shadow-none">
            No answers yet — be the first to help.
          </Card>
        ) : (
          answers.map((a) => (
            <Card key={a.id} className={`rounded-2xl border-border p-4 shadow-soft ${a.accepted ? 'border-found/40 bg-found-soft/40' : ''}`} data-testid={`answer-${a.id}`}>
              <div className="flex gap-3">
                <button
                  onClick={() => voteAnswer(a.id)}
                  data-testid={`vote-answer-${a.id}`}
                  className={`press flex h-fit shrink-0 flex-col items-center rounded-xl border px-2.5 py-2 text-xs font-bold ${
                    a.voted ? 'border-primary bg-secondary text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span data-testid={`answer-votes-${a.id}`}>{a.votes || 0}</span>
                </button>
                <div className="min-w-0 flex-1">
                  {a.accepted ? (
                    <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-found-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-found">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Most helpful
                    </p>
                  ) : null}
                  <p className="text-sm leading-relaxed">{a.body}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-6 w-6 border border-border">
                      <AvatarFallback className="bg-secondary text-[9px] font-semibold">{a.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {a.author} · {ago(a.createdAt)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="space-y-3 rounded-3xl border-border p-5 shadow-soft">
        <h2 className="text-lg font-bold">Your answer</h2>
        <Textarea
          rows={4}
          className="rounded-2xl"
          placeholder="Share what worked for you and your pet…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          data-testid="answer-input"
        />
        {error ? <p className="rounded-xl bg-lost-soft px-3 py-2 text-sm font-medium text-lost" data-testid="answer-error">{error}</p> : null}
        <Button className="press rounded-full" onClick={submitAnswer} disabled={sending} data-testid="answer-submit">
          {sending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Posting…</> : 'Post answer'}
        </Button>
      </Card>
    </div>
  )
}
