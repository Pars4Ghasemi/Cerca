'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { PageHeader, Chip, EmptyState, PlaceholderRows } from '@/components/cerca/ui-kit'
import { Star, MapPin, ChevronRight, ArrowLeft, SearchX } from 'lucide-react'

export default function SittersPage() {
  const [sitters, setSitters] = useState([])
  const [loading, setLoading] = useState(true)
  const [pet, setPet] = useState('all')
  const [sort, setSort] = useState('nearest')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/sitters')
      const data = await res.json()
      setSitters(data.sitters || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const visible = useMemo(() => {
    let list = sitters.filter((s) => (pet === 'all' ? true : (s.pets || []).includes(pet)))
    if (sort === 'nearest') list = [...list].sort((a, b) => a.distanceKm - b.distanceKm)
    if (sort === 'price') list = [...list].sort((a, b) => a.pricePerVisit - b.pricePerVisit)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [sitters, pet, sort])

  return (
    <div className="animate-fade-up space-y-4">
      <Link href="/services" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Services
      </Link>

      <PageHeader
        eyebrow="Pet Sitting"
        title="Sitters near you"
        subtitle="Local, reviewed sitters for day visits, walks and overnight stays."
      />

      <div className="space-y-2">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
          {[
            { id: 'all', label: 'All pets' },
            { id: 'Dogs', label: 'Dogs' },
            { id: 'Cats', label: 'Cats' },
          ].map((f) => (
            <Chip key={f.id} active={pet === f.id} onClick={() => setPet(f.id)} data-testid={`sitter-filter-${f.id}`}>{f.label}</Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
          {[
            { id: 'nearest', label: 'Nearest' },
            { id: 'price', label: 'Lowest price' },
            { id: 'rating', label: 'Top rated' },
          ].map((f) => (
            <Chip key={f.id} active={sort === f.id} onClick={() => setSort(f.id)} data-testid={`sitter-sort-${f.id}`}>{f.label}</Chip>
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground" data-testid="sitter-count">
          {loading ? 'Loading sitters…' : `${visible.length} sitter${visible.length === 1 ? '' : 's'} available`}
        </p>
      </div>

      {loading ? (
        <PlaceholderRows rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No sitters match this filter" description="Try showing all pets again." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((s) => (
            <Link key={s.id} href={`/services/sitters/${s.id}`} className="press" data-testid={`sitter-${s.id}`}>
              <Card className="flex h-full gap-3 rounded-2xl border-border p-3.5 shadow-soft transition-shadow hover:shadow-lift">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  <img src={s.photo} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold">{s.name}</p>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-current text-chart-3" /> {s.rating}
                      <span className="font-normal text-muted-foreground">({s.reviews})</span>
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {s.neighborhood} · {s.distanceKm} km
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.about}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">€{s.pricePerVisit} / visit</span>
                    {(s.pets || []).map((p) => (
                      <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{p}</span>
                    ))}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.available ? 'bg-found-soft text-found' : 'bg-muted text-muted-foreground'}`}>
                      {s.available ? 'Available' : 'Booked out'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
