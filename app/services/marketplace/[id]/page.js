'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, Star, Heart, Minus, Plus, ShoppingCart, Check, PawPrint } from 'lucide-react'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState(null)
  const [added, setAdded] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        fetch(`/api/products/${id}`).then((r) => r.json()),
        fetch('/api/cart').then((r) => r.json()),
      ])
      setProduct(p.product || null)
      setCart(c.cart || null)
    } catch {}
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const toggleFavorite = async () => {
    setProduct((p) => (p ? { ...p, favorite: !p.favorite } : p))
    try {
      const res = await fetch(`/api/products/${id}/favorite`, { method: 'POST' })
      const data = await res.json()
      if (data.product) setProduct(data.product)
    } catch {}
  }

  const addToCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, qty }),
      })
      const data = await res.json()
      if (data.cart) setCart(data.cart)
      toast.success(`${qty} x ${product.name} added to cart`)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
  }

  if (loading) return <PlaceholderRows rows={3} />
  if (!product) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold">Product not found.</p>
        <Button asChild variant="secondary" className="press rounded-full"><Link href="/services/marketplace">Back to marketplace</Link></Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/services/marketplace" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-marketplace">
          <ArrowLeft className="h-4 w-4" /> Marketplace
        </Link>
        <Button asChild variant="secondary" size="sm" className="press rounded-full">
          <Link href="/services/marketplace/cart" data-testid="open-cart">
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Cart
            <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground" data-testid="cart-count">{cart?.count ?? 0}</span>
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="h-56 w-full bg-muted sm:h-80">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{product.brand} · {product.category}</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight" data-testid="product-name">{product.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-bold text-foreground"><Star className="h-4 w-4 fill-current text-chart-3" /> {product.rating}</span>
              ({product.reviews} reviews)
            </p>
          </div>

          <p className="font-display text-3xl font-extrabold" data-testid="product-price">€{product.price.toFixed(2)}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            <PawPrint className="h-3.5 w-3.5" /> Suitable for: {product.suitability}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Quantity</span>
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground" data-testid="qty-minus" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(9, q + 1))} className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground" data-testid="qty-plus" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="press flex-1 rounded-full sm:flex-none" onClick={addToCart} data-testid="add-to-cart">
              {added ? <><Check className="mr-2 h-4 w-4" /> Added to cart</> : <><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</>}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`press rounded-full ${product.favorite ? 'border-lost text-lost' : ''}`}
              onClick={toggleFavorite}
              data-testid="save-product"
            >
              <Heart className={`mr-2 h-4 w-4 ${product.favorite ? 'fill-current' : ''}`} /> {product.favorite ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
