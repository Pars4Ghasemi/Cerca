'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PageHeader, Chip, SectionHeader, PlaceholderRows } from '@/components/cerca/ui-kit'
import { Flame, Trophy, CheckCircle2, Play, Clock, ChevronRight, Lock } from 'lucide-react'

const CATEGORIES = ['Basic Training', 'Behaviour', 'Pet Care', 'Nutrition', 'Safety', 'Enrichment']

export default function LearnPage() {
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState(null)
  const [badges, setBadges] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [l, p] = await Promise.all([
        fetch('/api/lessons').then((r) => r.json()),
        fetch('/api/progress').then((r) => r.json()),
      ])
      setLessons(l.lessons || [])
      setProgress(p.progress || null)
      setBadges(p.badges || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const done = progress?.completedLessons || []
  const today = lessons.find((l) => l.today)
  const visible = useMemo(
    () => (category === 'all' ? lessons : lessons.filter((l) => l.category === category)),
    [lessons, category]
  )
  const streakPct = progress ? Math.min(100, (progress.streak / progress.target) * 100) : 0

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Learn"
        title="Five minutes a day with Milo"
        subtitle="Small daily activities that make everyday life with your pet easier."
      />

      {/* streak header */}
      <Card className="grid gap-4 rounded-3xl border-border bg-secondary/60 p-5 shadow-soft sm:grid-cols-[1.2fr_1fr] sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-lost-soft text-2xl">🔥</span>
            <div>
              <p className="text-xl font-extrabold leading-tight" data-testid="learn-streak">{progress?.streak ?? 0} day streak</p>
              <p className="text-xs text-muted-foreground">{done.length} lesson{done.length === 1 ? '' : 's'} completed</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Weekly goal</span>
              <span>{progress?.streak ?? 0} / {progress?.target ?? 7}</span>
            </div>
            <Progress value={streakPct} className="h-2.5 bg-card" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-primary" /> Paw Points</span>
          <span className="font-display text-2xl font-extrabold" data-testid="learn-points">{progress?.points ?? 0}</span>
        </div>
      </Card>

      {/* today's task */}
      {today ? (
        <section>
          <SectionHeader title="Today's task" subtitle="Your daily 5-minute activity" />
          <Card className="overflow-hidden rounded-3xl border-border shadow-soft">
            <div className="space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">Today</span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{today.category}</span>
                {done.includes(today.id) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-found-soft px-3 py-1 text-xs font-bold text-found"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
                ) : null}
              </div>
              <h2 className="text-xl font-extrabold leading-snug">{today.title}</h2>
              <p className="text-sm text-muted-foreground">{today.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-muted px-3 py-1.5">{today.minutes} min</span>
                <span className="rounded-full bg-muted px-3 py-1.5">{today.difficulty}</span>
                <span className="rounded-full bg-accent px-3 py-1.5 text-accent-foreground">+{today.points} Paw Points</span>
              </div>
              <Button asChild size="lg" className="press mt-1 w-full rounded-full sm:w-auto">
                <Link href={`/learn/${today.id}`} data-testid="learn-start-today">
                  <Play className="mr-2 h-4 w-4" /> {done.includes(today.id) ? 'Review lesson' : 'Start lesson'}
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      {/* categories + lessons */}
      <section>
        <SectionHeader title="All lessons" subtitle="Pick a category" />
        <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 py-0.5">
          <Chip active={category === 'all'} onClick={() => setCategory('all')} data-testid="lesson-cat-all">All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)} data-testid={`lesson-cat-${c}`}>{c}</Chip>
          ))}
        </div>

        {loading ? (
          <PlaceholderRows rows={3} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((l) => (
              <Link key={l.id} href={`/learn/${l.id}`} className="press" data-testid={`lesson-${l.id}`}>
                <Card className="flex h-full items-start gap-3 rounded-2xl border-border p-4 shadow-soft transition-shadow hover:shadow-lift">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${done.includes(l.id) ? 'bg-found-soft text-found' : 'bg-secondary text-secondary-foreground'}`}>
                    {done.includes(l.id) ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">{l.category}</p>
                    <h3 className="font-bold leading-snug">{l.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                    <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.minutes} min</span>
                      <span>· {l.difficulty}</span>
                      <span>· +{l.points} pts</span>
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* rewards */}
      <section>
        <SectionHeader title="Rewards" subtitle="Badges you can unlock with Milo" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <Card key={b.id} className={`rounded-2xl border-border p-4 text-center shadow-soft ${b.unlocked ? '' : 'opacity-90'}`} data-testid={`badge-${b.id}`}>
              <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${b.unlocked ? 'bg-accent' : 'bg-muted'}`}>
                {b.unlocked ? b.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
              </span>
              <p className="mt-2 text-sm font-bold leading-tight">{b.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{b.description}</p>
              {!b.unlocked ? (
                <div className="mt-2 space-y-1">
                  <Progress value={(b.progress / b.target) * 100} className="h-1.5" />
                  <p className="text-[10px] font-semibold text-muted-foreground">{b.progress} / {b.target}</p>
                </div>
              ) : (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-found">Unlocked</p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
