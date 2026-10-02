'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeader, SectionHeader, EmptyState } from '@/components/cerca/ui-kit'
import { Bookmark, Flame, Trophy, PawPrint, Lock, ChevronRight, GraduationCap } from 'lucide-react'

const ago = (iso) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) } catch { return '' }
}

export default function ProfilePage() {
  const [data, setData] = useState(null)
  const [badges, setBadges] = useState([])
  const [saved, setSaved] = useState([])

  const load = useCallback(async () => {
    try {
      const [b, p, posts] = await Promise.all([
        fetch('/api/bootstrap').then((r) => r.json()),
        fetch('/api/progress').then((r) => r.json()),
        fetch('/api/posts').then((r) => r.json()),
      ])
      setData({ ...b, progress: p.progress || b.progress })
      setBadges(p.badges || b.badges || [])
      setSaved((posts.posts || []).filter((x) => x.saved))
    } catch {}
  }, [])

  useEffect(() => { load() }, [load])

  const user = data?.user
  const pet = data?.pet
  const progress = data?.progress
  const streakPct = progress ? Math.min(100, (progress.streak / progress.target) * 100) : 0

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader eyebrow="Profile" title="You &amp; your pet" subtitle="Your Cerca profile, Milo's pet profile, saved items and rewards." />

      <Card className="flex flex-col gap-5 rounded-3xl border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 border border-border">
          <AvatarFallback className="bg-accent text-xl font-bold text-accent-foreground">{user?.initials || 'MI'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">{user?.name || 'Mia'}</h2>
          <p className="text-sm text-muted-foreground">{user?.neighborhood}, {user?.city} · Cerca member</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lost-soft px-3 py-1.5 text-lost">
              <Flame className="h-3.5 w-3.5" /> {progress?.streak ?? 0} day streak
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
              <Trophy className="h-3.5 w-3.5" /> {progress?.points ?? 0} Paw Points
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
              <GraduationCap className="h-3.5 w-3.5" /> {(progress?.completedLessons || []).length} lessons
            </span>
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-4 rounded-3xl border-border bg-card p-5 shadow-soft">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {pet?.photo ? <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center"><PawPrint className="h-6 w-6" /></span>}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold">{pet?.name || 'Milo'}</h3>
          <p className="text-sm text-muted-foreground">{pet?.species} · {pet?.breed} · {pet?.age}</p>
          <p className="text-xs text-muted-foreground">{pet?.personality}</p>
        </div>
      </Card>

      <Card className="space-y-3 rounded-3xl border-border bg-secondary/60 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="font-bold">Weekly learning goal</p>
          <span className="text-sm font-semibold text-muted-foreground">{progress?.streak ?? 0} / {progress?.target ?? 7}</span>
        </div>
        <Progress value={streakPct} className="h-2.5 bg-card" />
        <Button asChild variant="secondary" className="press rounded-full bg-card hover:bg-card/80">
          <Link href="/learn">Continue learning <ChevronRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </Card>

      <section>
        <SectionHeader title="Badges" subtitle="Locked badges show your progress" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <Card key={b.id} className="rounded-2xl border-border p-4 text-center shadow-soft" data-testid={`profile-badge-${b.id}`}>
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

      <section>
        <SectionHeader title="Saved posts" subtitle="Things you bookmarked in the community" href="/community" actionLabel="Open feed" />
        {saved.length === 0 ? (
          <EmptyState icon={Bookmark} title="Nothing saved yet" description="Tap Save on a community post and it will show up here." />
        ) : (
          <div className="space-y-3">
            {saved.map((p) => (
              <Card key={p.id} className="flex gap-3 rounded-2xl border-border p-4 shadow-soft" data-testid={`saved-${p.id}`}>
                <Avatar className="h-10 w-10 shrink-0 border border-border">
                  <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{p.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{p.author}</span> · {ago(p.createdAt)}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{p.text}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
