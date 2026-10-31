'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customization } from './customization'
import { priceLine } from './pricing'

/* ===========================================================================
   Cart.

   Lives in localStorage so a half-built kit survives a refresh — people spend
   real time in the studio and losing it is the fastest way to lose the sale.
   Prices held here are for display only; checkout recomputes server-side.
   =========================================================================== */

export type CartItem = {
  /** Stable per-line id. Two lines can share a productId with different specs. */
  id: string
  productId: string
  slug: string
  name: string
  sku: string
  category: string
  basePrice: number

  size: string
  colorName: string
  bodyHex: string
  accentHex: string
  trimHex: string

  quantity: number
  /** null for an off-the-shelf piece. */
  customization: Customization | null

  addedAt: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean

  add: (item: Omit<CartItem, 'id' | 'addedAt'>) => void
  remove: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Two lines merge only when the garment, size, colourway AND print spec are
 * identical. A custom line practically never merges, which is correct — each
 * is its own production job.
 */
function sameLine(a: CartItem, b: Omit<CartItem, 'id' | 'addedAt'>) {
  return (
    a.productId === b.productId &&
    a.size === b.size &&
    a.colorName === b.colorName &&
    JSON.stringify(a.customization) === JSON.stringify(b.customization)
  )
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      add: (incoming) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, incoming))
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + incoming.quantity } : i,
              ),
              isOpen: true,
            }
          }
          const item: CartItem = {
            ...incoming,
            id: crypto.randomUUID(),
            addedAt: Date.now(),
          }
          return { items: [...state.items, item], isOpen: true }
        }),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(999, quantity)) } : i,
          ),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'athlon-cart',
      // isOpen is session UI state — never restore a drawer open on load.
      partialize: (s) => ({ items: s.items }),
    },
  ),
)

/* --- derived helpers ------------------------------------------------------ */

/** A roster defines its own garment count; otherwise use the line quantity. */
export function lineQuantity(item: CartItem) {
  const roster = item.customization?.roster ?? []
  if (roster.length > 0) return roster.reduce((n, r) => n + r.quantity, 0)
  return item.quantity
}

export function lineBreakdown(item: CartItem) {
  return priceLine(item.basePrice, item.customization, lineQuantity(item))
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + lineQuantity(i), 0)
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((n, i) => n + lineBreakdown(i).lineTotal, 0)
}
