'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, PlaceholderRows } from '@/components/cerca/ui-kit'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Info } from 'lucide-react'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkedOut, setCheckedOut] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      setCart(data.cart || null)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const call = async (action, payload) => {
    try {
      const res = await fetch(`/api/cart/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      })
      const data = await res.json()
      if (data.cart) setCart(data.cart)
    } catch {}
  }

  const items = cart?.items || []

  return (
    <div className="animate-fade-up space-y-5">
      <Link href="/services/marketplace" className="press inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground" data-testid="back-to-marketplace">
        <ArrowLeft className="h-4 w-4" /> Marketplace
      </Link>

      <PageHeader eyebrow="Cart" title="Your basket" subtitle="Checkout is disabled in this prototype — nothing is charged." />

      {loading ? (
        <PlaceholderRows rows={2} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the marketplace and add something Milo would approve of."
          action={<Button asChild className="press rounded-full"><Link href="/services/marketplace">Browse products</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <Card key={i.productId} className="flex items-center gap-3 rounded-2xl border-border p-3 shadow-soft" data-testid={`cart-item-${i.productId}`}>
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={i.product.image} alt={i.product.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{i.product.brand}</p>
                <p className="line-clamp-2 text-sm font-bold leading-snug">{i.product.name}</p>
                <p className="mt-1 text-sm font-semibold">€{i.product.price.toFixed(2)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center rounded-full border border-border bg-card">
                    <button onClick={() => call('update', { productId: i.productId, qty: i.qty - 1 })} className="press grid h-8 w-8 place-items-center rounded-full text-muted-foreground" data-testid={`dec-${i.productId}`} aria-label="Decrease">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold" data-testid={`qty-${i.productId}`}>{i.qty}</span>
                    <button onClick={() => call('update', { productId: i.productId, qty: i.qty + 1 })} className="press grid h-8 w-8 place-items-center rounded-full text-muted-foreground" data-testid={`inc-${i.productId}`} aria-label="Increase">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => call('remove', { productId: i.productId })} className="press inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted" data-testid={`remove-${i.productId}`}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
              <p className="shrink-0 self-start font-display text-base font-extrabold" data-testid={`line-${i.productId}`}>€{i.lineTotal.toFixed(2)}</p>
            </Card>
          ))}

          <Card className="space-y-3 rounded-3xl border-border p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Items</span>
              <span className="font-semibold" data-testid="cart-items-count">{cart?.count}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-bold">Subtotal</span>
              <span className="font-display text-2xl font-extrabold" data-testid="cart-subtotal">€{(cart?.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <Button size="lg" className="press w-full rounded-full" onClick={() => setCheckedOut(true)} data-testid="checkout">
              Demo checkout
            </Button>
            {checkedOut ? (
              <div className="flex items-start gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm" data-testid="checkout-message">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  <span className="font-semibold">Demo checkout</span> — payments are not enabled in this prototype. In the real product this is where delivery and payment would happen.
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  )
}
