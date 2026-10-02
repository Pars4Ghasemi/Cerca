'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SectionHeader, StatusBadge, PlaceholderRows } from '@/components/cerca/ui-kit'
import {
  MapPin, Sparkles, Flame, Dog, Heart, ShoppingBag, PlusCircle, Clock, Play, Trophy, MessageCircle, ChevronRight,
} from 'lucide-react'

const QUICK = [
  { icon: Dog, label: 'Pet Sitting', sub: 'Trusted locals', href: '/services' },
  { icon: Heart, label: 'Rehoming', sub: 'Find a new home', href: '/services' },
  { icon: ShoppingBag, label: 'Marketplace', sub: 'Everyday gear', href: '/services' },
  { icon: Sparkles, label: 'Ask Cerca AI', sub: 'Pet questions', href: '/ai' },
]

const timeAgo = (iso) => {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true })
  } catch {
    return 'recently'
  }
}

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/bootstrap')
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const user = data?.user
  const pet = data?.pet
  const progress = data?.progress
  const lesson = data?.todayLesson
  const reports = data?.nearbyReports || []
  const highlights = data?.highlights || []
  const streakPct = progress ? Math.min(100, (progress.streak / progress.target) * 100) : 0
  const remaining = progress ? Math.max(0, progress.target - progress.streak) : 0

  return (
    <div className="animate-fade-up space-y-8">
      {/* Greeting */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="bg-primary px-6 py-7 text-primary-foreground sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/70">
            {user?.city || 'Berlin'} · {user?.neighborhood || 'Prenzlauer Berg'}
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">Good afternoon, {user?.name || 'Mia'} 👋</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">How are you and {pet?.name || 'Milo'} doing today?</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="lg" variant="secondary" className="press rounded-full font-semibold">
              <Link href="/map?report=1" data-testid="cta-report">
                <PlusCircle className="mr-2 h-4 w-4" /> Report Lost or Found Pet
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="press rounded-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
              <Link href="/map">
                <MapPin className="mr-2 h-4 w-4" /> Open the map
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-sm text-muted-foreground sm:px-8">
          <span className="flex items-center gap-2">
            <StatusBadge status="lost" size="sm" /> {data?.counts?.lost ?? '—'} reports nearby
          </span>
          <span className="flex items-center gap-2">
            <StatusBadge status="found" size="sm" /> {data?.counts?.found ?? '—'} sightings shared
          </span>
        </div>
      </section>

      {/* Lost pets near you */}
      <section>
        <SectionHeader title="Lost Pets Near You" subtitle={`Reports around ${user?.city || 'Berlin'}`} href="/map" />
        {loading ? (
          <PlaceholderRows rows={2} />
        ) : reports.length === 0 ? (
          <Card className="rounded-2xl p-6 text-sm text-muted-foreground">No reports nearby right now.</Card>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {reports.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                href="/map"
                data-testid={`home-report-${r.id}`}
                className="press w-[240px] shrink-0 sm:w-[260px]"
              >
                <Card className="h-full overflow-hidden rounded-2xl border-border shadow-soft transition-shadow hover:shadow-lift">
                  <div className="relative h-32 w-full overflow-hidden bg-muted">
                    <img src={r.photo} alt={r.petName || `${r.species} ${r.status}`} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-2 top-2">
                      <StatusBadge status={r.status} size="sm" />
                    </span>
                  </div>
                  <div className="space-y-1 p-3.5">
                    <p className="truncate font-bold leading-tight">{r.petName || `Unnamed ${r.species.toLowerCase()}`}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {r.neighborhood}
                      {r.distanceKm ? ` · ${r.distanceKm} km` : ''}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {timeAgo(r.dateTime)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Daily lesson + streak */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col justify-between gap-4 rounded-3xl border-border bg-card p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70">Today&apos;s 5-minute lesson</p>
            <h3 className="mt-1.5 text-lg font-extrabold leading-snug sm:text-xl">{lesson?.title || 'Loading lesson…'}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{lesson?.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">{lesson?.minutes ?? 5} min</span>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">{lesson?.difficulty || 'Easy'}</span>
              <span className="rounded-full bg-accent px-3 py-1.5 text-accent-foreground">+{lesson?.points ?? 20} Paw Points</span>
            </div>
          </div>
          <Button asChild size="lg" className="press w-full rounded-full sm:w-auto sm:self-start">
            <Link href={lesson?.id ? `/learn/${lesson.id}` : '/learn'} data-testid="cta-start-lesson">
              <Play className="mr-2 h-4 w-4" /> Start lesson
            </Link>
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-4 rounded-3xl border-border bg-secondary/60 p-5 shadow-soft sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-lost-soft text-xl">🔥</span>
              <div>
                <p className="text-lg font-extrabold leading-tight" data-testid="streak-count">{progress?.streak ?? 0} day streak</p>
                <p className="text-xs text-muted-foreground">Keep it going with {pet?.name || 'Milo'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Weekly goal</span>
                <span>{progress?.streak ?? 0} / {progress?.target ?? 7}</span>
              </div>
              <Progress value={streakPct} className="h-2.5 bg-card" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Complete <span className="font-semibold text-foreground">{remaining} more day{remaining === 1 ? '' : 's'}</span> to unlock the Explorer badge.
            </p>
          </div>
          <Link href="/learn" className="press block" data-testid="home-open-learn">
            <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-primary" /> Paw Points
              </span>
              <span className="font-display text-lg font-extrabold" data-testid="paw-points">{progress?.points ?? 0}</span>
            </div>
          </Link>
        </Card>
      </section>

      {/* Community highlights */}
      <section>
        <SectionHeader title="From your community" subtitle="What pet owners nearby are talking about" href="/community" />
        {loading ? (
          <PlaceholderRows rows={2} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((p) => (
              <Link key={p.id} href="/community" className="press">
                <Card className="flex h-full gap-3 rounded-2xl border-border p-4 shadow-soft transition-shadow hover:shadow-lift">
                  <Avatar className="h-10 w-10 shrink-0 border border-border">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{p.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{p.author}</span> with {p.petName} · {timeAgo(p.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed">{p.text}</p>
                    <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {p.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {p.comments}</span>
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick services */}
      <section>
        <SectionHeader title="Quick services" subtitle="Everything for life with your pet" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK.map((q) => (
            <Link key={q.label} href={q.href} className="press">
              <Card className="flex h-full flex-col items-start gap-2.5 rounded-2xl border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-lift">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <q.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold leading-tight">{q.label}</span>
                <span className="text-xs text-muted-foreground">{q.sub}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Cerca AI shortcut */}
      <Link href="/ai" className="press block">
        <Card className="flex items-center gap-4 rounded-3xl border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Ask Cerca AI</p>
            <p className="text-sm text-muted-foreground">Training, behaviour and everyday care questions — answered in seconds.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Card>
      </Link>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        <Link href="/design-system" className="font-semibold text-primary underline-offset-2 hover:underline">Design system</Link>
      </p>
    </div>
  )
}
