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
import { ArrowLeft, Star, MapPin, CheckCircle2, Loader2, Quote } from 'lucide-react'

function todayPlus(days) {
  const d = new Date(Date.now() + days * 86400000)
  return d.toISOString().slice(0, 10)
}

export default function SitterProfilePage() {
  const { id } = useParams()
  const [sitter, setSitter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [form, setForm] = useState({ pet: 'Milo', date: todayPlus(2), serviceType: '', message: '' })

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/sitters/${id}`)
      const data = await res.json()
      setSitter(data.sitter || null)
      if (data.sitter) {
        setForm((f) => ({
          ...f,
          serviceType: data.sitter.services?.[0] || 'Day visit',
          message: `Hi ${data.sitter.name}, could you look after Milo (3y Golden Retriever) that day? He is friendly and used to other dogs.`,
        }))
      }
    } catch {}
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    if (!form.date) return setError('Please choose a date for the visit.')
    if (form.message.trim().length < 5) return setError('Add a short message for the sitter.')
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitterId: id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send the request')
      setConfirmed(data.booking)
      toast.success(`Request sent to ${data.booking.sitterName}`)
      setOpen(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <PlaceholderRows rows={3} />
  if (!sitter) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold">Sitter not found.</p>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/services/sitters">Back to sitters</Link></Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-5">
      <Link href="/services/sitters" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-sitters">
        <ArrowLeft className="h-4 w-4" /> Pet sitters
      </Link>

      {confirmed ? (
        <Card className="animate-fade-up flex flex-col items-center gap-3 rounded-3xl border-border bg-found-soft/60 p-6 text-center shadow-soft" data-testid="booking-confirmation">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-card text-found shadow-soft">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="text-xl font-extrabold">Request sent to {confirmed.sitterName}</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {confirmed.serviceType} for {confirmed.pet} on {confirmed.date}. {confirmed.sitterName} usually replies within a few hours. No payment is taken in this prototype.
          </p>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="h-44 w-full bg-muted sm:h-56">
          <img src={sitter.photo} alt={sitter.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold" data-testid="sitter-name">{sitter.name}</h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {sitter.neighborhood} · approx. {sitter.distanceKm} km away
              </p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 font-bold">
                <Star className="h-4 w-4 fill-current text-chart-3" /> {sitter.rating}
                <span className="text-sm font-normal text-muted-foreground">({sitter.reviews})</span>
              </p>
              <p className="font-display text-lg font-extrabold">€{sitter.pricePerVisit}<span className="text-sm font-medium text-muted-foreground"> / visit</span></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">{sitter.experience} experience</span>
            {(sitter.pets || []).map((p) => (
              <span key={p} className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{p}</span>
            ))}
            <span className={`rounded-full px-3 py-1.5 ${sitter.available ? 'bg-found-soft text-found' : 'bg-muted text-muted-foreground'}`}>
              {sitter.available ? 'Available this week' : 'Booked out this week'}
            </span>
          </div>

          <div>
            <h2 className="mb-1 font-bold">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{sitter.about}</p>
          </div>

          <div>
            <h2 className="mb-2 font-bold">Services</h2>
            <div className="flex flex-wrap gap-2">
              {(sitter.services || []).map((s) => (
                <span key={s} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{s}</span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold">What owners say</h2>
            {(sitter.testimonials || []).map((t, i) => (
              <div key={i} className="rounded-2xl bg-muted/70 p-4">
                <Quote className="mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-sm leading-relaxed">{t.text}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">— {t.author}</p>
              </div>
            ))}
          </div>

          <Button size="lg" className="press w-full rounded-full sm:w-auto" onClick={() => setOpen(true)} data-testid="open-booking">
            Request Pet Sitting
          </Button>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request {sitter.name}</DialogTitle>
            <DialogDescription>No payment is taken — this is a demo request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bk-pet">Pet</Label>
                <Input id="bk-pet" className="rounded-xl" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} data-testid="booking-pet" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-date">Date</Label>
                <Input id="bk-date" type="date" className="rounded-xl" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="booking-date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <div className="flex flex-wrap gap-2">
                {(sitter.services || []).map((s) => (
                  <Chip key={s} active={form.serviceType === s} onClick={() => setForm({ ...form, serviceType: s })}>{s}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-msg">Message</Label>
              <Textarea id="bk-msg" rows={4} className="rounded-2xl" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="booking-message" />
            </div>
            {error ? <p className="rounded-xl bg-lost-soft px-3 py-2 text-sm font-medium text-lost" data-testid="booking-error">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="press rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="press rounded-full" onClick={submit} disabled={sending} data-testid="booking-submit">
              {sending ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending…</> : 'Send request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
