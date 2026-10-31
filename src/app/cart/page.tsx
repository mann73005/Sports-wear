'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Wand2 } from 'lucide-react'
import {
  cartSubtotal,
  lineBreakdown,
  lineQuantity,
  useCart,
  type CartItem,
} from '@/lib/cart-store'
import { PRINT_METHODS, PLACEMENTS, type PlacementId } from '@/lib/customization'
import { SHIPPING_METHODS, TAX_RATE } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import type { GarmentType } from '@/art/garment-paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator, Skeleton } from '@/components/ui/misc'

export default function CartPage() {
  const { items, remove, setQuantity, clear } = useCart()

  // The store hydrates from localStorage after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="gutter py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const tax = Math.round(subtotal * TAX_RATE)
  const units = items.reduce((n, i) => n + lineQuantity(i), 0)

  if (items.length === 0) {
    return (
      <div className="gutter py-24">
        <div className="grid-paper mx-auto flex max-w-xl flex-col items-center gap-6 rounded-xl border border-carbon-200 p-14 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-carbon-200 bg-white">
            <ShoppingBag className="h-6 w-6 text-carbon-400" />
          </div>
          <div>
            <h1 className="text-display-sm font-display font-bold">Your cart is empty</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-carbon-600">
              Seventeen blanks on the shelf, all of them printable. Start from a piece you like,
              or go straight into the studio and build a kit from scratch.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button asChild>
              <Link href="/shop">Browse the shelf</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/studio">Open the studio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gutter py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-display font-bold">Your cart</h1>
          <p className="tabular mt-2 text-sm text-carbon-500">
            {items.length} line{items.length === 1 ? '' : 's'} · {units} garment
            {units === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={clear}
          className="text-xs text-carbon-500 underline underline-offset-4 transition-colors hover:text-danger"
        >
          Empty the cart
        </button>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <ul>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <CartRow
                  item={item}
                  onRemove={() => remove(item.id)}
                  onQuantity={(q) => setQuantity(item.id, q)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {/* --- summary --------------------------------------------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-carbon-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold">Summary</h2>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-carbon-600">Subtotal</dt>
                <dd className="tabular">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Estimated tax</dt>
                <dd className="tabular">{formatMoney(tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Shipping</dt>
                <dd className="text-carbon-500">Chosen at checkout</dd>
              </div>
            </dl>

            <Separator className="my-4" />

            <div className="flex items-baseline justify-between">
              <span className="font-medium">Total</span>
              <span className="tabular font-display text-2xl font-bold">
                {formatMoney(subtotal + tax)}
              </span>
            </div>
            <p className="mt-1 text-xs text-carbon-500">
              Before shipping. Standard is free on every order.
            </p>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href="/checkout">
                Checkout
                <ArrowRight />
              </Link>
            </Button>

            <ul className="mt-5 space-y-2 border-t border-carbon-100 pt-4 text-xs text-carbon-500">
              {Object.values(SHIPPING_METHODS).map((m) => (
                <li key={m.id} className="flex justify-between gap-3">
                  <span>
                    {m.label} · {m.days}
                  </span>
                  <span className="tabular shrink-0">
                    {m.price === 0 ? 'Free' : formatMoney(m.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CartRow({
  item,
  onRemove,
  onQuantity,
}: {
  item: CartItem
  onRemove: () => void
  onQuantity: (q: number) => void
}) {
  const b = lineBreakdown(item)
  const c = item.customization
  const units = lineQuantity(item)
  const hasRoster = (c?.roster.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-5 border-b border-carbon-200 py-6 sm:flex-row">
      <Link
        href={`/product/${item.slug}`}
        className="relative h-40 w-32 shrink-0 overflow-hidden rounded-lg bg-carbon-100 transition-colors hover:bg-carbon-200"
      >
        <div className="grid-paper absolute inset-0 opacity-40" aria-hidden />
        <div className="absolute inset-0 p-3">
          <Garment
            type={item.category as GarmentType}
            bodyHex={item.bodyHex}
            accentHex={item.accentHex}
            trimHex={item.trimHex}
            customization={c}
            shadow={false}
          />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="font-medium transition-colors hover:text-field-700"
            >
              {item.name}
            </Link>
            <p className="tabular mt-1 text-xs text-carbon-500">
              {item.sku} · {item.colorName} · {hasRoster ? 'Mixed sizes' : item.size}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="shrink-0 rounded-xs p-1.5 text-carbon-400 transition-colors hover:bg-carbon-100 hover:text-danger"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* --- the print spec, in production terms ---------------------- */}
        {c ? (
          <div className="mt-3.5 rounded-sm border border-carbon-200 bg-carbon-50 p-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="brand">
                <Wand2 className="h-2.5 w-2.5" />
                {PRINT_METHODS[c.method].label}
              </Badge>
              {c.teamName ? <Badge variant="outline">{c.teamName}</Badge> : null}
              {c.artwork.map((a) => (
                <Badge key={a.placement} variant="outline">
                  {PLACEMENTS[a.placement as PlacementId].label}
                </Badge>
              ))}
            </div>

            {hasRoster ? (
              <ul className="tabular mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-carbon-600">
                {c.roster.slice(0, 8).map((r) => (
                  <li key={r.id}>
                    <span className="font-medium">{r.number || '—'}</span>{' '}
                    {r.playerName || 'unnamed'}{' '}
                    <span className="text-carbon-400">
                      {r.size}×{r.quantity}
                    </span>
                  </li>
                ))}
                {c.roster.length > 8 ? (
                  <li className="text-carbon-400">+{c.roster.length - 8} more</li>
                ) : null}
              </ul>
            ) : null}

            {c.notes ? (
              <p className="mt-3 border-t border-carbon-200 pt-2.5 text-[11px] italic text-carbon-500">
                “{c.notes}”
              </p>
            ) : null}
          </div>
        ) : null}

        {/* --- price breakdown ------------------------------------------ */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          {hasRoster ? (
            <span className="tabular text-sm text-carbon-500">{units} garments</span>
          ) : (
            <div className="flex items-center rounded-sm border border-carbon-200">
              <button
                onClick={() => onQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="grid h-9 w-9 place-items-center text-carbon-600 transition-colors hover:bg-carbon-100 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="tabular w-10 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => onQuantity(item.quantity + 1)}
                className="grid h-9 w-9 place-items-center text-carbon-600 transition-colors hover:bg-carbon-100"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="text-right">
            <p className="tabular text-lg font-medium">{formatMoney(b.lineTotal)}</p>
            <p className="tabular text-xs text-carbon-500">
              {formatMoney(Math.round(b.lineTotal / units))} each
              {b.discount > 0 ? (
                <span className="ml-2 text-ok">−{Math.round(b.discountRate * 100)}%</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
