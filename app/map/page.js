'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNowStrict } from 'date-fns'
import LostFoundMap from '@/components/cerca/lost-found-map'
import ReportDetail from '@/components/cerca/report-detail'
import ReportWizard from '@/components/cerca/report-wizard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, Chip, StatusBadge, EmptyState } from '@/components/cerca/ui-kit'
import { MapPin, PlusCircle, List, Map as MapIcon, Clock, SearchX, ChevronRight } from 'lucide-react'

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'lost', label: 'Lost' },
  { id: 'found', label: 'Found' },
]
const SPECIES_FILTERS = [
  { id: 'all', label: 'All species' },
  { id: 'dog', label: 'Dogs' },
  { id: 'cat', label: 'Cats' },
  { id: 'other', label: 'Other' },
]

const timeAgo = (iso) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) } catch { return 'recently' }
}

export default function MapPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [species, setSpecies] = useState('all')
  const [view, setView] = useState('map')
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/reports')
      const data = await res.json()
      setReports(data.reports || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // open wizard directly from Home CTA (/map?report=1)
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('report')) {
      setWizardOpen(true)
      window.history.replaceState({}, '', '/map')
    }
  }, [])

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (status !== 'all' && r.status !== status) return false
      if (species !== 'all') {
        const s = String(r.species || '').toLowerCase()
        if (species === 'other' ? s === 'dog' || s === 'cat' : s !== species) return false
      }
      return true
    })
  }, [reports, status, species])

  const selected = reports.find((r) => r.id === selectedId) || null

  const openReport = (id) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const onPublished = (report) => {
    setReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)])
    setStatus('all')
    setSpecies('all')
    setSelectedId(report.id)
    toast.success('Your report is live on the map')
  }

  const lostCount = filtered.filter((r) => r.status === 'lost').length
  const foundCount = filtered.filter((r) => r.status === 'found').length

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        eyebrow="Lost &amp; Found"
        title="Pets reported around Berlin"
        subtitle="See lost pets and sightings near you — or publish a report in under a minute."
        action={
          <Button size="lg" className="press rounded-full" onClick={() => setWizardOpen(true)} data-testid="map-cta-report">
            <PlusCircle className="mr-2 h-4 w-4" /> Report Lost or Found Pet
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
            {STATUS_FILTERS.map((f) => (
              <Chip key={f.id} active={status === f.id} onClick={() => setStatus(f.id)} data-testid={`filter-${f.id}`}>
                {f.label}
              </Chip>
            ))}
            <span className="mx-1 w-px shrink-0 bg-border" />
            {SPECIES_FILTERS.map((f) => (
              <Chip key={f.id} active={species === f.id} onClick={() => setSpecies(f.id)} data-testid={`species-${f.id}`}>
                {f.label}
              </Chip>
            ))}
          </div>

          <div className="inline-flex shrink-0 rounded-full border border-border bg-card p-1 shadow-soft">
            {[
              { id: 'map', label: 'Map', icon: MapIcon },
              { id: 'list', label: 'List', icon: List },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                data-testid={`view-${v.id}`}
                className={`press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  view === v.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <v.icon className="h-4 w-4" /> {v.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs font-medium text-muted-foreground" data-testid="results-count">
          {loading ? 'Loading reports…' : `${filtered.length} report${filtered.length === 1 ? '' : 's'} · ${lostCount} lost · ${foundCount} found`}
        </p>
      </div>

      {view === 'map' ? (
        filtered.length === 0 && !loading ? (
          <EmptyState
            icon={SearchX}
            title="No reports match these filters"
            description="Try switching back to All, or widen the species filter."
            action={
              <Button variant="secondary" className="press rounded-full" onClick={() => { setStatus('all'); setSpecies('all') }}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            <LostFoundMap
              className="h-[62vh] min-h-[360px] w-full overflow-hidden rounded-3xl border border-border shadow-soft sm:h-[540px]"
              reports={filtered}
              selectedId={selectedId}
              onSelect={openReport}
            />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><StatusBadge status="lost" size="sm" /> round pin · missing pet</span>
              <span className="flex items-center gap-2"><StatusBadge status="found" size="sm" /> square pin · sighting or safe pet</span>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No reports match these filters"
              description="Try switching back to All, or widen the species filter."
              action={
                <Button variant="secondary" className="press rounded-full" onClick={() => { setStatus('all'); setSpecies('all') }}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            filtered.map((r) => (
              <button key={r.id} onClick={() => openReport(r.id)} data-testid={`list-item-${r.id}`} className="press block w-full text-left">
                <Card className="flex items-center gap-4 rounded-2xl border-border p-3 shadow-soft transition-shadow hover:shadow-lift">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img src={r.photo} alt={r.petName || r.species} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} size="sm" />
                      <p className="truncate font-bold">{r.petName || `Unnamed ${String(r.species).toLowerCase()}`}</p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{r.species} · {r.breed}</p>
                    <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.neighborhood}{r.distanceKm ? ` · ${r.distanceKm} km` : ''}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeAgo(r.dateTime)}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Card>
              </button>
            ))
          )}
        </div>
      )}

      <ReportDetail report={selected} open={detailOpen} onOpenChange={setDetailOpen} />

      {wizardOpen ? (
        <ReportWizard onClose={() => setWizardOpen(false)} onPublished={onPublished} />
      ) : null}
    </div>
  )
}
