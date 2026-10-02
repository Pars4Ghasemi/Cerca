'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { BERLIN_CENTER } from '@/lib/berlin'

function pinHtml(report, selected) {
  const glyph = report.status === 'found' ? '✓' : '!'
  const shape = report.status === 'found' ? 'square' : 'round'
  return `<div class="cerca-pin" data-status="${report.status}" data-shape="${shape}" data-selected="${selected ? 'true' : 'false'}"><span>${glyph}</span></div>`
}

export default function LostFoundMap({
  reports = [],
  selectedId = null,
  onSelect,
  pickMode = false,
  picked = null,
  onPick,
  className = '',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const LRef = useRef(null)
  const layerRef = useRef(null)
  const pickMarkerRef = useRef(null)
  const sigRef = useRef('')
  const [ready, setReady] = useState(false)

  const onPickRef = useRef(onPick)
  const onSelectRef = useRef(onSelect)
  const pickModeRef = useRef(pickMode)
  onPickRef.current = onPick
  onSelectRef.current = onSelect
  pickModeRef.current = pickMode

  // init map once
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const mod = await import('leaflet')
      const L = mod.default || mod
      if (cancelled || !containerRef.current || mapRef.current) return
      LRef.current = L
      const map = L.map(containerRef.current, {
        center: [BERLIN_CENTER.lat, BERLIN_CENTER.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
      })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      layerRef.current = L.layerGroup().addTo(map)
      map.on('click', (e) => {
        if (pickModeRef.current && onPickRef.current) {
          onPickRef.current({
            lat: Math.round(e.latlng.lat * 1e5) / 1e5,
            lng: Math.round(e.latlng.lng * 1e5) / 1e5,
          })
        }
      })
      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 200)
      setTimeout(() => map.invalidateSize(), 800)
      setReady(true)
    })()
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // render report markers
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!ready || !L || !map || !layerRef.current) return
    layerRef.current.clearLayers()

    reports.forEach((r) => {
      if (typeof r.lat !== 'number' || typeof r.lng !== 'number') return
      const selected = r.id === selectedId
      const marker = L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: 'cerca-pin-wrap',
          html: pinHtml(r, selected),
          iconSize: [34, 42],
          iconAnchor: [17, 40],
        }),
        zIndexOffset: selected ? 1000 : 0,
        keyboard: false,
      })
      const label = `${r.status === 'lost' ? 'Lost' : 'Found'} · ${r.petName || r.species} · ${r.neighborhood}`
      marker.bindTooltip(label, { direction: 'top', offset: [0, -38], opacity: 1 })
      marker.on('click', () => onSelectRef.current && onSelectRef.current(r.id))
      marker.addTo(layerRef.current)
    })

    const sig = reports.map((r) => r.id).join('|')
    if (sig !== sigRef.current && reports.length > 0) {
      sigRef.current = sig
      const bounds = L.latLngBounds(reports.filter((r) => r.lat && r.lng).map((r) => [r.lat, r.lng]))
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 14 })
    }
  }, [reports, selectedId, ready])

  // pan to selection
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !selectedId) return
    const r = reports.find((x) => x.id === selectedId)
    if (r && r.lat && r.lng) map.panTo([r.lat, r.lng], { animate: true })
  }, [selectedId, ready, reports])

  // picked location marker
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!ready || !L || !map) return
    if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current)
      pickMarkerRef.current = null
    }
    if (picked) {
      pickMarkerRef.current = L.marker([picked.lat, picked.lng], {
        icon: L.divIcon({
          className: 'cerca-pin-wrap',
          html: '<div class="cerca-pin" data-status="pick" data-shape="round" data-selected="true"><span>⚑</span></div>',
          iconSize: [34, 42],
          iconAnchor: [17, 40],
        }),
      }).addTo(map)
      map.panTo([picked.lat, picked.lng], { animate: true })
    }
  }, [picked, ready])

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} data-testid="leaflet-map" className="h-full w-full rounded-3xl" />
      {!ready ? (
        <div className="absolute inset-0 grid place-items-center rounded-3xl bg-muted/70">
          <span className="animate-pulse-soft text-sm font-semibold text-muted-foreground">Loading map…</span>
        </div>
      ) : null}
      {pickMode ? (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-semibold text-background shadow-lift">
          Tap the map to set the location
        </div>
      ) : null}
    </div>
  )
}
