'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { PageHeader, Chip, PlaceholderRows, EmptyState } from '@/components/cerca/ui-kit'
import { ArrowLeft, MapPin, ChevronRight, SearchX } from 'lucide-react'

export default function RehomingPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [species, setSpecies] = useState('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/rehoming')
      const data = await res.json()
      setPets(data.rehoming || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const visible = useMemo(
    () => (species === 'all' ? pets : pets.filter((p) => p.species === species)),
    [pets, species]
  )

  return (
    <div className="animate-fade-up space-y-4">
      <Link href="/services" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Services
      </Link>

      <PageHeader
        eyebrow="Rehoming"
        title="Pets Looking for a New Home"
        subtitle="Honest profiles from owners who can no longer keep their pet."
      />

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
        {[
          { id: 'all', label: 'All' },
          { id: 'Dog', label: 'Dogs' },
          { id: 'Cat', label: 'Cats' },
        ].map((f) => (
          <Chip key={f.id} active={species === f.id} onClick={() => setSpecies(f.id)} data-testid={`rehoming-filter-${f.id}`}>{f.label}</Chip>
        ))}
      </div>

      {loading ? (
        <PlaceholderRows rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No pets in this category" description="Try showing all listings again." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((p) => (
            <Link key={p.id} href={`/services/rehoming/${p.id}`} className="press" data-testid={`rehoming-${p.id}`}>
              <Card className="h-full overflow-hidden rounded-3xl border-border shadow-soft transition-shadow hover:shadow-lift">
                <div className="h-44 w-full overflow-hidden bg-muted">
                  <img src={p.photo} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="space-y-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-lg font-extrabold">{p.name}</h3>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">{p.species}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.breed} · {p.age}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {p.neighborhood}</p>
                  <p className="line-clamp-2 pt-1 text-sm">{p.personality}</p>
                  <span className="inline-flex items-center pt-1 text-sm font-semibold text-primary">View profile <ChevronRight className="h-4 w-4" /></span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
