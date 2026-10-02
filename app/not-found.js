import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-3xl">🐾</span>
      <h1 className="text-2xl font-extrabold">This page wandered off</h1>
      <p className="text-sm text-muted-foreground">
        The page you were looking for is not here. Let&apos;s get you back to something useful.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="press rounded-full"><Link href="/">Go to Home</Link></Button>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/map">Open the map</Link></Button>
      </div>
    </div>
  )
}
