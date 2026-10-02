'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, Chip, EmptyState, PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, Star, Heart, ShoppingCart, SearchX, Plus, Check } from 'lucide-react'

const CATEGORIES = ['Food', 'Toys', 'Beds', 'Walking', 'Grooming', 'Travel']

export default function MarketplacePage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [added, setAdded] = useState({})

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/cart').then((r) => r.json()),
      ])
      setProducts(p.products || [])
      setCart(c.cart || null)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const visible = useMemo(
    () => (category === 'all' ? products : products.filter((p) => p.category === category)),
    [products, category]
  )

  const toggleFavorite = async (product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, favorite: !p.favorite } : p)))
    try {
      const res = await fetch(`/api/products/${product.id}/favorite`, { method: 'POST' })
      const data = await res.json()
      if (data.product) {
        setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product : p)))
        toast(data.product.favorite ? `Saved ${data.product.name}` : 'Removed from saved')
      }
    } catch {}
  }

  const addToCart = async (product) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      })
      const data = await res.json()
      if (data.cart) setCart(data.cart)
      toast.success(`${product.name} added to cart`)
      setAdded((a) => ({ ...a, [product.id]: true }))
      setTimeout(() => setAdded((a) => ({ ...a, [product.id]: false })), 1600)
    } catch {}
  }

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/services" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Services
        </Link>
        <Button asChild variant="secondary" size="sm" className="press rounded-full">
          <Link href="/services/marketplace/cart" data-testid="open-cart">
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Cart
            <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground" data-testid="cart-count">
              {cart?.count ?? 0}
            </span>
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Marketplace"
        title="Everyday gear for city pets"
        subtitle="A small curated selection — food, toys, beds, walking, grooming and travel."
      />

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
        <Chip active={category === 'all'} onClick={() => setCategory('all')} data-testid="cat-all">All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)} data-testid={`cat-${c}`}>{c}</Chip>
        ))}
      </div>

      {loading ? (
        <PlaceholderRows rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState icon={SearchX} title="Nothing in this category yet" description="Try another category — the demo catalogue is small." />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {visible.map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden rounded-2xl border-border shadow-soft transition-shadow hover:shadow-lift" data-testid={`product-${p.id}`}>
              <div className="relative">
                <Link href={`/services/marketplace/${p.id}`} className="press block h-32 w-full overflow-hidden bg-muted sm:h-40" data-testid={`open-product-${p.id}`}>
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                </Link>
                <button
                  onClick={() => toggleFavorite(p)}
                  data-testid={`fav-${p.id}`}
                  aria-label="Save product"
                  className={`press absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur ${p.favorite ? 'text-lost' : 'text-muted-foreground'}`}
                >
                  <Heart className={`h-4 w-4 ${p.favorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{p.brand}</p>
                <Link href={`/services/marketplace/${p.id}`} className="press">
                  <p className="line-clamp-2 text-sm font-bold leading-snug">{p.name}</p>
                </Link>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-current text-chart-3" /> {p.rating} <span>({p.reviews})</span>
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="font-display text-base font-extrabold">€{p.price.toFixed(2)}</span>
                  <Button size="icon" className="press h-9 w-9 shrink-0 rounded-full" onClick={() => addToCart(p)} data-testid={`add-${p.id}`} aria-label="Add to cart">
                    {added[p.id] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
