/* Berlin geo helpers for the Cerca demo — no external geocoding needed */

export const HOME = { lat: 52.5401, lng: 13.4241, label: 'Prenzlauer Berg' }

export const BERLIN_CENTER = { lat: 52.5155, lng: 13.4059 }

export const NEIGHBORHOODS = [
  { name: 'Prenzlauer Berg', lat: 52.5401, lng: 13.4241 },
  { name: 'Mitte', lat: 52.5231, lng: 13.4048 },
  { name: 'Friedrichshain', lat: 52.5148, lng: 13.4543 },
  { name: 'Kreuzberg', lat: 52.4987, lng: 13.4183 },
  { name: 'Neukölln', lat: 52.4811, lng: 13.4342 },
  { name: 'Wedding', lat: 52.5487, lng: 13.3651 },
  { name: 'Schöneberg', lat: 52.4831, lng: 13.3553 },
  { name: 'Charlottenburg', lat: 52.5063, lng: 13.3039 },
  { name: 'Moabit', lat: 52.5300, lng: 13.3400 },
  { name: 'Lichtenberg', lat: 52.5158, lng: 13.4980 },
  { name: 'Treptow', lat: 52.4890, lng: 13.4620 },
  { name: 'Weißensee', lat: 52.5560, lng: 13.4600 },
  { name: 'Tempelhof', lat: 52.4670, lng: 13.4010 },
  { name: 'Steglitz', lat: 52.4560, lng: 13.3320 },
]

export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function nearestNeighborhood(point) {
  let best = NEIGHBORHOODS[0]
  let bestD = Infinity
  for (const n of NEIGHBORHOODS) {
    const d = haversineKm(point, n)
    if (d < bestD) {
      bestD = d
      best = n
    }
  }
  return best.name
}

export function distanceFromHome(point) {
  return Math.round(haversineKm(HOME, point) * 10) / 10
}
