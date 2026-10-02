'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Chip, PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, MapPin, CheckCircle2, Loader2, ShieldCheck, Home, Heart } from 'lucide-react'

const EXPERIENCE = ['First-time owner', 'Some experience', 'Very experienced']
const HOMES = ['Flat with balcony', 'Flat, no balcony', 'House with garden']
const OTHER_PETS = ['No other pets', 'One dog', 'One cat', 'Several pets']

export default function RehomingDetailPage() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [form, setForm] = useState({
    experience: 'Some experience',
    homeSituation: 'Flat with balcony',
    otherPets: 'One dog',
    message: '',
  })

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/rehoming/${id}`)
      const data = await res.json()
      setPet(data.pet || null)
      if (data.pet) {
        setForm((f) => ({
          ...f,
          message: `Hi, I would love to meet ${data.pet.name}. I live in Prenzlauer Berg with my 3-year-old Golden Retriever Milo and work from home three days a week.`,
        }))
      }
    } catch {}
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send your interest')
      setDone(data.interest)
      toast.success(`Interest in ${data.interest.petName} sent`)
      setOpen(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <PlaceholderRows rows={3} />
  if (!pet) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold">Listing not found.</p>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/services/rehoming">Back to rehoming</Link></Button>
      </div>
    )
  }

  const gallery = pet.gallery?.length ? pet.gallery : [pet.photo]

  return (
    <div className="animate-fade-up space-y-5">
      <Link href="/services/rehoming" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-rehoming">
        <ArrowLeft className="h-4 w-4" /> Rehoming
      </Link>

      {done ? (
        <Card className="animate-fade-up flex flex-col items-center gap-3 rounded-3xl border-border bg-found-soft/60 p-6 text-center shadow-soft" data-testid="interest-confirmation">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-card text-found shadow-soft">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="text-xl font-extrabold">Your interest in {done.petName} was sent</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            The current owner will review your message and reply in Cerca. Rehoming is always arranged directly between people — nothing is transferred in this prototype.
          </p>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="h-56 w-full bg-muted sm:h-80">
          <img src={gallery[active]} alt={pet.name} className="h-full w-full object-cover" />
        </div>
        {gallery.length > 1 ? (
          <div className="flex gap-2 px-4 pt-3">
            {gallery.map((g, i) => (
              <button
                key={g + i}
                onClick={() => setActive(i)}
                data-testid={`gallery-${i}`}
                className={`press h-14 w-14 overflow-hidden rounded-xl border-2 ${active === i ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h1 className="text-2xl font-extrabold" data-testid="rehoming-name">{pet.name}</h1>
            <p className="text-sm text-muted-foreground">{pet.species} · {pet.breed} · {pet.age}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {pet.neighborhood}, Berlin</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full px-3 py-1.5 ${pet.vaccinated ? 'bg-found-soft text-found' : 'bg-muted text-muted-foreground'}`}>{pet.vaccinated ? 'Vaccinated' : 'Vaccinations pending'}</span>
            <span className={`rounded-full px-3 py-1.5 ${pet.neutered ? 'bg-found-soft text-found' : 'bg-muted text-muted-foreground'}`}>{pet.neutered ? 'Neutered' : 'Not neutered yet'}</span>
            <span className={`rounded-full px-3 py-1.5 ${pet.microchipped ? 'bg-found-soft text-found' : 'bg-muted text-muted-foreground'}`}>{pet.microchipped ? 'Microchipped' : 'No chip yet'}</span>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="mb-1 flex items-center gap-2 font-bold"><Heart className="h-4 w-4 text-primary" /> Personality</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{pet.personality}</p>
            </div>
            <div>
              <h2 className="mb-1 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-primary" /> Health</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{pet.health}</p>
            </div>
            <div>
              <h2 className="mb-1 flex items-center gap-2 font-bold"><Home className="h-4 w-4 text-primary" /> Ideal home</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{pet.idealHome}</p>
            </div>
            <div className="rounded-2xl bg-muted/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Reason for rehoming</p>
              <p className="mt-1 text-sm leading-relaxed">{pet.reason}</p>
            </div>
          </div>

          <Button size="lg" className="press w-full rounded-full sm:w-auto" onClick={() => setOpen(true)} data-testid="open-interest">
            I&apos;m Interested
          </Button>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Interested in {pet.name}</DialogTitle>
            <DialogDescription>Tell the current owner about your home. This is a demo — no ownership is transferred.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Experience with pets</Label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE.map((o) => (
                  <Chip key={o} active={form.experience === o} onClick={() => setForm({ ...form, experience: o })}>{o}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Home situation</Label>
              <div className="flex flex-wrap gap-2">
                {HOMES.map((o) => (
                  <Chip key={o} active={form.homeSituation === o} onClick={() => setForm({ ...form, homeSituation: o })}>{o}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Other pets</Label>
              <div className="flex flex-wrap gap-2">
                {OTHER_PETS.map((o) => (
                  <Chip key={o} active={form.otherPets === o} onClick={() => setForm({ ...form, otherPets: o })}>{o}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="int-msg">Message</Label>
              <Textarea id="int-msg" rows={4} className="rounded-2xl" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="interest-message" />
            </div>
            {error ? <p className="rounded-xl bg-lost-soft px-3 py-2 text-sm font-medium text-lost" data-testid="interest-error">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="press rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="press rounded-full" onClick={submit} disabled={sending} data-testid="interest-submit">
              {sending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending…</> : 'Send interest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
