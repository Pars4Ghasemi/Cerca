'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, CheckCircle2, Clock, Flame, Trophy, Loader2, Sparkles } from 'lucide-react'

export default function LessonPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  const load = useCallback(async () => {
    try {
      const [l, p] = await Promise.all([
        fetch('/api/lessons').then((r) => r.json()),
        fetch('/api/progress').then((r) => r.json()),
      ])
      setLesson((l.lessons || []).find((x) => x.id === id) || null)
      setProgress(p.progress || null)
      setBadges(p.badges || [])
    } catch {}
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const completed = (progress?.completedLessons || []).includes(id)

  const complete = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: id }),
      })
      const data = await res.json()
      setProgress(data.progress)
      setBadges(data.badges || [])
      setResult(data)
      if (!data.already) toast.success(`+${data.awarded} Paw Points \u00b7 ${data.progress?.streak} day streak`)
    } catch {}
    setSaving(false)
  }

  if (loading) return <PlaceholderRows rows={3} />
  if (!lesson) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold">Lesson not found.</p>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/learn">Back to Learn</Link></Button>
      </div>
    )
  }

  const explorer = badges.find((b) => b.id === 'bd-explorer')

  return (
    <div className="animate-fade-up space-y-5">
      <Link href="/learn" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-learn">
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>

      {result ? (
        <Card className="animate-fade-up space-y-4 rounded-3xl border-border bg-secondary/60 p-6 text-center shadow-soft" data-testid="lesson-celebration">
          <span className="mx-auto grid h-20 w-20 animate-fade-up place-items-center rounded-full bg-card text-4xl shadow-lift">
            {result.already ? '✅' : '🎉'}
          </span>
          <h2 className="text-2xl font-extrabold">
            {result.already ? 'Already completed today' : 'Nice work with Milo!'}
          </h2>
          {!result.already ? (
            <p className="text-sm font-semibold text-primary" data-testid="awarded-points">+{result.awarded} Paw Points</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-card px-4 py-3">
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Flame className="h-4 w-4 text-lost" /> Streak</p>
              <p className="font-display text-2xl font-extrabold" data-testid="result-streak">{result.progress?.streak} days</p>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4 text-primary" /> Paw Points</p>
              <p className="font-display text-2xl font-extrabold" data-testid="result-points">{result.progress?.points}</p>
            </div>
          </div>
          {explorer && !explorer.unlocked ? (
            <div className="space-y-1.5 rounded-2xl bg-card px-4 py-3 text-left">
              <p className="text-xs font-semibold text-muted-foreground">🌍 Explorer badge · {explorer.progress} / {explorer.target} days</p>
              <Progress value={(explorer.progress / explorer.target) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{explorer.target - explorer.progress} more day{explorer.target - explorer.progress === 1 ? '' : 's'} to unlock it.</p>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild className="press rounded-full"><Link href="/learn" data-testid="celebration-back">Back to Learn</Link></Button>
            <Button asChild variant="secondary" className="press rounded-full"><Link href="/profile">See my badges</Link></Button>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4 rounded-3xl border-border p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{lesson.category}</span>
          {lesson.today ? <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">Today</span> : null}
          {completed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-found-soft px-3 py-1 text-xs font-bold text-found" data-testid="lesson-completed-badge">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight" data-testid="lesson-title">{lesson.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Clock className="h-3.5 w-3.5" /> {lesson.minutes} min</span>
          <span className="rounded-full bg-muted px-3 py-1.5">{lesson.difficulty}</span>
          <span className="rounded-full bg-accent px-3 py-1.5 text-accent-foreground">+{lesson.points} Paw Points</span>
        </div>

        <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
          <p className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-primary" /> Today&apos;s activity</p>
          <ol className="space-y-2.5">
            {(lesson.steps || []).map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <Button
          size="lg"
          className="press w-full rounded-full sm:w-auto"
          onClick={complete}
          disabled={saving || completed}
          data-testid="mark-completed"
        >
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : completed ? 'Completed ✓' : 'Mark as Completed'}
        </Button>
      </Card>
    </div>
  )
}
