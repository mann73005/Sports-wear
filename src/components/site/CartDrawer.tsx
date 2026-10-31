'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import {
  cartSubtotal,
  lineBreakdown,
  lineQuantity,
  useCart,
  type CartItem,
} from '@/lib/cart-store'
import { nextTier, SHIPPING_METHODS } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import type { GarmentType } from '@/art/garment-paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/misc'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const subtotal = mounted ? cartSubtotal(items) : 0
  const freeOver = SHIPPING_METHODS.express.freeOver
  const toFreeShipping = Math.max(0, freeOver - subtotal)

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && close()}>
      <SheetContent className="flex flex-col p-0">
        <div className="flex items-center gap-3 border-b border-carbon-200 px-6 py-5">
          <SheetTitle className="font-display text-xl tracking-tight">Your cart</SheetTitle>
          {mounted && items.length > 0 ? (
            <Badge variant="muted">{items.length} line{items.length === 1 ? '' : 's'}</Badge>
          ) : null}
        </div>

        {!mounted || items.length === 0 ? (
          <EmptyCart onClose={close} />
        ) : (
          <>
            {/* Progress toward free express shipping. A concrete, honest nudge
                beats a banner that just says "free shipping over $250". */}
            <div className="border-b border-carbon-200 bg-carbon-50 px-6 py-3.5">
              {toFreeShipping > 0 ? (
                <>
                  <p className="text-xs text-carbon-600">
                    <span className="tabular font-medium text-carbon-900">
                      {formatMoney(toFreeShipping)}
                    </span>{' '}
                    away from free express shipping
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-carbon-200">
                    <motion.div
                      className="h-full bg-field-700"
                      initial={false}
                      animate={{ width: `${Math.min(100, (subtotal / freeOver) * 100)}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs font-medium text-ok">Free express shipping unlocked.</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <CartLine
                      item={item}
                      onRemove={() => remove(item.id)}
                      onQuantity={(q) => setQuantity(item.id, q)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <CartFooter items={items} subtotal={subtotal} onClose={close} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartLine({
  item,
  onRemove,
  onQuantity,
}: {
  item: CartItem
  onRemove: () => void
  onQuantity: (q: number) => void
}) {
  const breakdown = lineBreakdown(item)
  const units = lineQuantity(item)
  const custom = item.customization
  const hasRoster = (custom?.roster.length ?? 0) > 0

  return (
    <div className="flex gap-4 border-b border-carbon-100 py-5">
      <Link
        href={`/product/${item.slug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-carbon-100 transition-colors hover:bg-carbon-200"
      >
        <Garment
          type={item.category as GarmentType}
          bodyHex={item.bodyHex}
          accentHex={item.accentHex}
          trimHex={item.trimHex}
          customization={custom}
          shadow={false}
          className="scale-[1.15]"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${item.slug}`}
            className="text-sm font-medium leading-snug transition-colors hover:text-field-700"
          >
            {item.name}
          </Link>
          <button
            onClick={onRemove}
            className="shrink-0 rounded-xs p-1 text-carbon-400 transition-colors hover:bg-carbon-100 hover:text-danger"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="tabular mt-1 text-xs text-carbon-500">
          {item.colorName} · {hasRoster ? 'Mixed sizes' : item.size}
        </p>

        {custom ? (
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="brand">Custom</Badge>
            {custom.teamName ? <Badge variant="outline">{custom.teamName}</Badge> : null}
            {hasRoster ? (
              <Badge variant="outline">{custom.roster.length} names</Badge>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          {hasRoster ? (
            // A roster defines its own counts — editing quantity here would
            // silently contradict the named shirts.
            <span className="tabular text-xs text-carbon-500">{units} garments</span>
          ) : (
            <div className="flex items-center rounded-sm border border-carbon-200">
              <button
                onClick={() => onQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="grid h-7 w-7 place-items-center text-carbon-600 transition-colors hover:bg-carbon-100 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="tabular w-8 text-center text-xs font-medium">{item.quantity}</span>
              <button
                onClick={() => onQuantity(item.quantity + 1)}
                className="grid h-7 w-7 place-items-center text-carbon-600 transition-colors hover:bg-carbon-100"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}

          <span className="tabular text-sm font-medium">{formatMoney(breakdown.lineTotal)}</span>
        </div>

        {breakdown.discount > 0 ? (
          <p className="tabular mt-1.5 text-[11px] text-ok">
            Volume break −{formatMoney(breakdown.discount)}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CartFooter({
  items,
  subtotal,
  onClose,
}: {
  items: CartItem[]
  subtotal: number
  onClose: () => void
}) {
  // Surface the next volume break on whichever line is closest to it — a
  // club two shirts short of 10% off should be told so.
  const best = items
    .map((i) => ({ item: i, units: lineQuantity(i), next: nextTier(lineQuantity(i)) }))
    .filter((x) => x.next !== null)
    .sort((a, b) => a.next!.min - a.units - (b.next!.min - b.units))[0]

  return (
    <div className="border-t border-carbon-200 bg-carbon-50 px-6 py-5">
      {best ? (
        <p className="mb-3 rounded-sm border border-carbon-200 bg-white px-3 py-2 text-xs text-carbon-600">
          Add{' '}
          <span className="tabular font-medium text-carbon-900">
            {best.next!.min - best.units}
          </span>{' '}
          more of{' '}
          <span className="font-medium text-carbon-900">{best.item.name}</span> for{' '}
          <span className="font-medium text-field-700">
            {Math.round(best.next!.discount * 100)}% off
          </span>{' '}
          that line.
        </p>
      ) : null}

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-carbon-600">Subtotal</span>
        <span className="tabular font-display text-xl font-bold">{formatMoney(subtotal)}</span>
      </div>
      <p className="mt-1 text-xs text-carbon-500">Shipping and tax calculated at checkout.</p>

      <Separator className="my-4" />

      <div className="grid gap-2">
        <Button size="lg" asChild onClick={onClose}>
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild onClick={onClose}>
          <Link href="/cart">View full cart</Link>
        </Button>
      </div>
    </div>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid-paper flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-carbon-200 bg-white">
        <ShoppingBag className="h-6 w-6 text-carbon-400" />
      </div>
      <div>
        <p className="font-display text-lg">Nothing in the cart</p>
        <p className="mt-1.5 max-w-xs text-sm text-carbon-500">
          Pick a piece off the shelf, or take one into the studio and put your own mark on it.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild onClick={onClose}>
          <Link href="/shop">Browse kit</Link>
        </Button>
        <Button variant="outline" asChild onClick={onClose}>
          <Link href="/studio">Open the studio</Link>
        </Button>
      </div>
    </div>
  )
}
