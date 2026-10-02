'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import LostFoundMap from '@/components/cerca/lost-found-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { StatusBadge, Chip } from '@/components/cerca/ui-kit'
import { PET_IMAGES } from '@/lib/seed-data'
import { nearestNeighborhood, distanceFromHome } from '@/lib/berlin'
import { X, ArrowLeft, ArrowRight, Camera, CheckCircle2, MapPin, Upload, Search, Loader2 } from 'lucide-react'

const SAMPLES = [PET_IMAGES.yorkie, PET_IMAGES.gingerCat, PET_IMAGES.blackDog, PET_IMAGES.greyCat, PET_IMAGES.whiteTerrier, PET_IMAGES.tuxedoCat]
const SPECIES = ['Dog', 'Cat', 'Other']
const SIZES = ['Small', 'Medium', 'Large']
const CONTACTS = ['In-app message', 'Phone call']
const TOTAL_STEPS = 5

function localNow() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function fileToDataUrl(file) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
  // downscale for demo persistence
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const max = 900
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export default function ReportWizard({ onClose, onPublished }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(null)
  const [form, setForm] = useState({
    status: '',
    photo: '',
    petName: '',
    species: '',
    breed: '',
    color: '',
    size: 'Medium',
    lat: null,
    lng: null,
    neighborhood: '',
    dateTime: localNow(),
    description: '',
    contact: 'In-app message',
  })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const isLost = form.status === 'lost'
  const picked = form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null

  const previewReport = useMemo(
    () => ({
      id: 'preview',
      status: form.status || 'lost',
      petName: form.petName || null,
      species: form.species || 'Other',
      breed: form.breed || 'Unknown',
      color: form.color || '—',
      size: form.size,
      neighborhood: form.neighborhood || 'Berlin',
      lat: form.lat,
      lng: form.lng,
      dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : new Date().toISOString(),
      description: form.description,
      photo: form.photo,
      contact: form.contact,
      reporter: 'Mia',
    }),
    [form]
  )

  const validate = (s) => {
    if (s === 1 && !form.status) return 'Please choose whether you lost a pet or found one.'
    if (s === 2) {
      if (!form.photo) return 'Add a photo so people can recognise the pet.'
      if (!form.species) return 'Please select the species.'
      if (isLost && !form.petName.trim()) return "Please add your pet's name."
      if (!form.color.trim()) return 'Please describe the colour — it helps identification.'
    }
    if (s === 3 && (form.lat == null || form.lng == null)) return 'Tap the map to mark the location.'
    if (s === 4) {
      if (!form.dateTime) return 'Please add the date and time.'
      if (form.description.trim().length < 10) return 'Add a short description (at least 10 characters).'
    }
    return ''
  }

  const next = () => {
    const msg = validate(step)
    if (msg) return setError(msg)
    setError('')
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }
  const back = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const publish = async () => {
    setPublishing(true)
    setError('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateTime: new Date(form.dateTime).toISOString(),
          distanceKm: distanceFromHome({ lat: form.lat, lng: form.lng }),
          note: isLost ? 'Reported through Cerca — please message me with any sighting.' : 'Reported through Cerca — message me to confirm the match.',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not publish the report')
      setPublished(data.report)
      onPublished && onPublished(data.report)
    } catch (e) {
      setError(e.message)
    } finally {
      setPublishing(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-background" data-testid="report-wizard">
      {/* header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold">
              {published ? 'Report published' : 'Report a Lost or Found Pet'}
            </p>
            {!published ? <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</p> : null}
          </div>
          <Button variant="ghost" size="icon" className="press rounded-full" onClick={onClose} aria-label="Close" data-testid="wizard-close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {!published ? (
          <div className="mx-auto mt-2 w-full max-w-2xl">
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
          </div>
        ) : null}
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto w-full max-w-2xl space-y-5">
          {published ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center" data-testid="wizard-success">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-found-soft text-found">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h2 className="text-2xl font-extrabold">Your report is live</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {published.petName || `The ${String(published.species).toLowerCase()}`} now appears on the Cerca map in {published.neighborhood}. Neighbours nearby can see it immediately.
              </p>
              <Button size="lg" className="press rounded-full" onClick={onClose} data-testid="wizard-view-map">
                View on the map
              </Button>
            </div>
          ) : null}

          {!published && step === 1 ? (
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold">What happened?</h2>
              {[
                { id: 'lost', title: 'I lost my pet', copy: 'Alert neighbours and get sightings fast.' },
                { id: 'found', title: 'I found a pet', copy: 'Help reunite an animal with its owner.' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => { set({ status: o.id }); setError('') }}
                  data-testid={`wizard-status-${o.id}`}
                  className={`press flex w-full items-center gap-4 rounded-2xl border p-5 text-left ${
                    form.status === o.id ? 'border-primary bg-secondary shadow-soft' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <StatusBadge status={o.id} />
                  <span className="min-w-0">
                    <span className="block font-bold">{o.title}</span>
                    <span className="block text-sm text-muted-foreground">{o.copy}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {!published && step === 2 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">About the pet</h2>

              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-border bg-muted">
                    {form.photo ? (
                      <img src={form.photo} alt="Selected pet" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted-foreground"><Camera className="h-6 w-6" /></span>
                    )}
                  </div>
                  <label className="press inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold">
                    <Upload className="h-4 w-4" /> Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const url = await fileToDataUrl(f)
                        set({ photo: url })
                        setError('')
                      }}
                    />
                  </label>
                </div>
                <p className="pt-1 text-xs text-muted-foreground">Or pick a demo photo:</p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {SAMPLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { set({ photo: s }); setError('') }}
                      data-testid="wizard-sample-photo"
                      className={`press h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${form.photo === s ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={s} alt="Sample pet" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Species</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES.map((s) => (
                    <Chip key={s} active={form.species === s} onClick={() => { set({ species: s }); setError('') }} data-testid={`wizard-species-${s.toLowerCase()}`}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="w-name">Name {isLost ? '' : '(optional)'}</Label>
                  <Input id="w-name" data-testid="wizard-name" className="rounded-xl" placeholder={isLost ? 'e.g. Milo' : 'Unknown'} value={form.petName} onChange={(e) => set({ petName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="w-breed">Breed (optional)</Label>
                  <Input id="w-breed" className="rounded-xl" placeholder="e.g. Golden Retriever" value={form.breed} onChange={(e) => set({ breed: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="w-color">Colour</Label>
                  <Input id="w-color" data-testid="wizard-color" className="rounded-xl" placeholder="e.g. Golden with white chest" value={form.color} onChange={(e) => set({ color: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <div className="flex gap-2">
                    {SIZES.map((s) => (
                      <Chip key={s} active={form.size === s} onClick={() => set({ size: s })}>{s}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!published && step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Where {isLost ? 'was your pet last seen' : 'did you find the pet'}?</h2>
              <LostFoundMap
                className="h-[300px] w-full overflow-hidden rounded-3xl border border-border sm:h-[380px]"
                reports={[]}
                pickMode
                picked={picked}
                onPick={(p) => {
                  set({ lat: p.lat, lng: p.lng, neighborhood: nearestNeighborhood(p) })
                  setError('')
                }}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="w-hood">Neighbourhood</Label>
                  <Input id="w-hood" data-testid="wizard-neighborhood" className="rounded-xl" placeholder="Tap the map or type it" value={form.neighborhood} onChange={(e) => set({ neighborhood: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {picked ? `${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}` : 'No location selected yet'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {!published && step === 4 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Details</h2>
              <div className="space-y-1.5">
                <Label htmlFor="w-date">{isLost ? 'Last seen' : 'Found'} date &amp; time</Label>
                <Input id="w-date" data-testid="wizard-date" type="datetime-local" className="rounded-xl" value={form.dateTime} onChange={(e) => set({ dateTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w-desc">Description</Label>
                <Textarea
                  id="w-desc"
                  data-testid="wizard-description"
                  rows={5}
                  className="rounded-2xl"
                  placeholder={isLost ? 'Where did you last see them, how do they behave with strangers, any collar or chip?' : 'Where exactly did you find the pet, collar, condition, where is the pet now?'}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact preference</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTACTS.map((c) => (
                    <Chip key={c} active={form.contact === c} onClick={() => set({ contact: c })}>{c}</Chip>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!published && step === 5 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold">Preview your report</h2>
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                <div className="relative h-52 bg-muted">
                  {form.photo ? <img src={form.photo} alt="Pet" className="h-full w-full object-cover" /> : null}
                  <span className="absolute left-3 top-3"><StatusBadge status={previewReport.status} /></span>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold">{previewReport.petName || `Unnamed ${String(previewReport.species).toLowerCase()}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {previewReport.species} · {previewReport.breed} · {previewReport.color} · {previewReport.size}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {previewReport.neighborhood} · {format(new Date(previewReport.dateTime), 'd MMM yyyy, HH:mm')}
                  </p>
                  <p className="text-sm leading-relaxed">{previewReport.description}</p>
                  <p className="text-xs text-muted-foreground">Contact via {previewReport.contact}</p>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-lost-soft px-4 py-3 text-sm font-medium text-lost" data-testid="wizard-error">{error}</p>
          ) : null}
        </div>
      </div>

      {/* footer */}
      {!published ? (
        <div className="shrink-0 border-t border-border bg-card px-4 py-3">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
            <Button variant="ghost" className="press rounded-full" onClick={step === 1 ? onClose : back}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step < TOTAL_STEPS ? (
              <Button className="press rounded-full" onClick={next} data-testid="wizard-next">
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button className="press rounded-full" onClick={publish} disabled={publishing} data-testid="wizard-publish">
                {publishing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Publishing…</> : 'Publish report'}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  )
}
