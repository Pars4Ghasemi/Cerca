# Cerca — neighbourhood pet ecosystem (demo)

A city-based pet app demo: Lost & Found map, community + Q&A, daily learning with streaks,
pet services (sitting, rehoming), a marketplace with cart, and Cerca AI (RAG-grounded pet assistant).

Built with Next.js 15 (App Router, JavaScript), Tailwind + shadcn/ui, MongoDB, Leaflet + OpenStreetMap.

## Quick start

```bash
yarn install
cp .env.example .env     # then fill in the values
yarn dev                 # http://localhost:3000
```

Required env vars (see `.env.example`):

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the app |
| `EMERGENT_LLM_KEY` | Key used by Cerca AI (`emergentintegrations`, model `openai/gpt-4.1-mini`) |

Demo data self-seeds on the first API request. To reset everything:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Routes

| Screen | Path |
|---|---|
| Home | `/` |
| Lost & Found map | `/map` |
| Community + Q&A | `/community`, `/community/questions/[id]` |
| Learning | `/learn`, `/learn/[id]` |
| Profile (badges, saved) | `/profile` |
| Services | `/services`, `/services/sitters[/id]`, `/services/rehoming[/id]` |
| Marketplace | `/services/marketplace[/id]`, `/services/marketplace/cart` |
| Cerca AI | `/ai` |
| Design system | `/design-system` |

## API (single catch-all route: `app/api/[[...path]]/route.js`)

`GET` `/api/health` · `/api/bootstrap` · `/api/reports?status=&species=` · `/api/posts` ·
`/api/questions[/id]` · `/api/lessons` · `/api/products[/id]` · `/api/sitters[/id]` ·
`/api/rehoming[/id]` · `/api/badges` · `/api/progress` · `/api/cart` · `/api/knowledge` ·
`/api/ai/messages?session_id=`

`POST` `/api/reports` · `/api/posts` · `/api/posts/:id/like|save|comments` · `/api/questions` ·
`/api/questions/:id/vote|answers` · `/api/questions/:id/answers/:aid/vote` · `/api/progress/complete` ·
`/api/bookings` · `/api/interests` · `/api/contacts` · `/api/products/:id/favorite` ·
`/api/cart[/update|/remove|/clear]` · `/api/ai/chat` · `/api/seed`

## Demo scope / honesty notes

- No real payments (marketplace checkout is explicitly a demo), no real messaging delivery,
  no authentication, no ownership transfer for rehoming.
- Cerca AI gives educational guidance only, escalates suspected veterinary emergencies to
  in-person care, and refuses non-pet questions.
