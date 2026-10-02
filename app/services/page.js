'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/cerca/ui-kit'
import { Dog, Heart, ShoppingBag, ChevronRight } from 'lucide-react'

const MODULES = [
  {
    href: '/services/sitters',
    icon: Dog,
    title: 'Find a Pet Sitter',
    copy: 'Local sitters with ratings, prices and availability — send a request in a minute.',
    testid: 'module-sitters',
  },
  {
    href: '/services/rehoming',
    icon: Heart,
    title: 'Rehoming & Adoption',
    copy: 'Pets looking for a loving new home in Berlin, with honest profiles.',
    testid: 'module-rehoming',
  },
  {
    href: '/services/marketplace',
    icon: ShoppingBag,
    title: 'Marketplace',
    copy: 'Food, toys, beds, walking and grooming essentials picked for city pets.',
    testid: 'module-marketplace',
  },
]

export default function ServicesPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Services"
        title="Everything your pet needs, nearby"
        subtitle="Trusted sitters, pets looking for a new home, and a curated marketplace."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="press" data-testid={m.testid}>
            <Card className="flex h-full flex-col gap-3 rounded-3xl border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <m.icon className="h-5 w-5" />
              </span>
              <h3 className="font-bold leading-snug">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.copy}</p>
              <span className="mt-auto inline-flex items-center pt-2 text-sm font-semibold text-primary">
                Open <ChevronRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
