'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/cerca/ui-kit'
import { MapPin, Clock, PawPrint, Ruler, Palette, CheckCircle2, MessageCircle, Phone, ArrowLeft } from 'lucide-react'

const safeAgo = (iso) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) } catch { return 'recently' }
}
const safeDate = (iso) => {
  try { return format(new Date(iso), 'd MMM yyyy, HH:mm') } catch { return '—' }
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ReportDetail({ report, open, onOpenChange }) {
  const [step, setStep] = useState('view')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open && report) {
      setStep('view')
      setMessage(
        report.status === 'lost'
          ? `Hi ${report.reporter}, I think I saw ${report.petName || 'your pet'} near ${report.neighborhood} today. Happy to share details.`
          : `Hi ${report.reporter}, this might be my pet. Could you tell me more about the collar and where exactly you found them?`
      )
    }
  }, [open, report])

  if (!report) return null

  const isLost = report.status === 'lost'
  const title = report.petName || `Unnamed ${String(report.species || 'pet').toLowerCase()}`

  const send = async () => {
    setSending(true)
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, to: report.reporter, message, kind: isLost ? 'sighting' : 'claim' }),
      })
    } catch {}
    setSending(false)
    setStep('sent')
    toast.success(`Message sent to ${report.reporter}`)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] overflow-hidden" data-testid="report-detail">
        <div className="mx-auto flex w-full max-w-lg flex-col overflow-y-auto pb-8">
          {step === 'view' ? (
            <>
              <div className="relative mx-4 mt-2 h-52 overflow-hidden rounded-2xl bg-muted sm:h-64">
                <img src={report.photo} alt={title} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3"><StatusBadge status={report.status} /></span>
              </div>

              <DrawerHeader className="px-4 pb-2 text-left">
                <DrawerTitle className="text-xl font-extrabold" data-testid="detail-title">{title}</DrawerTitle>
                <DrawerDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {report.neighborhood}{report.distanceKm ? ` · ${report.distanceKm} km away` : ''}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {safeAgo(report.dateTime)}</span>
                </DrawerDescription>
              </DrawerHeader>

              <div className="grid grid-cols-2 gap-4 px-4 py-3">
                <MetaRow icon={PawPrint} label="Species" value={report.species} />
                <MetaRow icon={PawPrint} label="Breed" value={report.breed} />
                <MetaRow icon={Palette} label="Colour" value={report.color} />
                <MetaRow icon={Ruler} label="Size" value={report.size} />
                <MetaRow icon={Clock} label={isLost ? 'Last seen' : 'Found on'} value={safeDate(report.dateTime)} />
                <MetaRow icon={MessageCircle} label="Contact" value={report.contact} />
              </div>

              <div className="space-y-3 px-4">
                <p className="text-sm leading-relaxed text-foreground">{report.description}</p>
                {report.note ? (
                  <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Note from {isLost ? 'the owner' : 'the finder'} · {report.reporter}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{report.note}</p>
                  </div>
                ) : null}
              </div>

              <div className="sticky bottom-0 mt-5 border-t border-border bg-card px-4 pt-4">
                <Button size="lg" className="press w-full rounded-full" onClick={() => setStep('contact')} data-testid="detail-cta">
                  {isLost ? 'I Saw This Pet' : 'This Might Be My Pet'}
                </Button>
              </div>
            </>
          ) : null}

          {step === 'contact' ? (
            <div className="px-4 pt-4">
              <button onClick={() => setStep('view')} className="press mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to report
              </button>
              <DrawerHeader className="px-0 pb-3 text-left">
                <DrawerTitle className="text-xl font-extrabold">Message {report.reporter}</DrawerTitle>
                <DrawerDescription>
                  {isLost ? 'Share where and when you saw the pet. Photos help a lot.' : 'Describe your pet so the finder can confirm the match.'}
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-msg">Your message</Label>
                  <Textarea id="contact-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-2xl" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {report.contact === 'Phone call' ? <Phone className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  Preferred contact: <span className="font-semibold text-foreground">{report.contact}</span>
                </div>
                <Button size="lg" className="press w-full rounded-full" disabled={sending || message.trim().length < 5} onClick={send} data-testid="contact-send">
                  {sending ? 'Sending…' : 'Send message'}
                </Button>
              </div>
            </div>
          ) : null}

          {step === 'sent' ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center" data-testid="contact-sent">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-found-soft text-found">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="text-xl font-extrabold">Message sent to {report.reporter}</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {report.reporter} will get a notification in Cerca. In this prototype no real message is delivered.
              </p>
              <Button variant="secondary" className="press mt-2 rounded-full" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
