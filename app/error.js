'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-lost-soft text-3xl">🙅</span>
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        That is on us. Try again — your data in Cerca is safe.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button className="press rounded-full" onClick={() => reset()}>Try again</Button>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  )
}
