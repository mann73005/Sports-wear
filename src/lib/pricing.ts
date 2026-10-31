import { PRINT_METHODS, type Customization } from './customization'

/* ===========================================================================
   Pricing engine.

   Shared by the studio (which runs it on every keystroke to animate the live
   total) and by the checkout route handler (which runs it again server-side).
   The server NEVER trusts a price sent by the browser — it rebuilds every
   line from the product row plus the submitted spec and compares. Keeping one
   implementation means the two can't drift.
   =========================================================================== */

/** Volume breaks. A club ordering 30 shirts should not pay the one-off rate. */
export const QUANTITY_TIERS = [
  { min: 1, discount: 0 },
  { min: 6, discount: 0.05 },
  { min: 12, discount: 0.1 },
  { min: 25, discount: 0.15 },
  { min: 50, discount: 0.22 },
] as const

export function tierFor(quantity: number) {
  return [...QUANTITY_TIERS].reverse().find((t) => quantity >= t.min) ?? QUANTITY_TIERS[0]
}

export function nextTier(quantity: number) {
  return QUANTITY_TIERS.find((t) => t.min > quantity) ?? null
}

/** Surcharges for the name/number service, per garment. */
export const NAME_PRICE = 600
export const NUMBER_PRICE = 450
export const TEAM_NAME_PRICE = 500

export type PriceLine = { label: string; detail?: string; amount: number }

export type PriceBreakdown = {
  /** Per-unit garment price before any print work. */
  unitBase: number
  /** Per-unit cost of the print work. */
  unitPrint: number
  /** One-off screen/embroidery setup, charged per line not per unit. */
  setup: number
  quantity: number
  /** (unitBase + unitPrint) * qty, before the volume break. */
  grossSubtotal: number
  discountRate: number
  discount: number
  /** What the line actually costs: gross - discount + setup. */
  lineTotal: number
  lines: PriceLine[]
}

/**
 * Cost one cart line.
 *
 * `quantity` is the total garment count. When a roster is present it is the
 * sum of the roster entries, because each entry is a physical garment.
 */
export function priceLine(
  basePrice: number,
  customization: Customization | null,
  quantity: number,
): PriceBreakdown {
  const qty = Math.max(1, quantity)
  const lines: PriceLine[] = [{ label: 'Garment', detail: `${qty} x`, amount: basePrice * qty }]

  let unitPrint = 0
  let setup = 0

  if (customization) {
    const method = PRINT_METHODS[customization.method]

    // Each distinct artwork placement costs per-unit, plus a one-off setup
    // for methods that need a screen burned or a design digitised.
    const placements = new Set(customization.artwork.map((a) => a.placement))
    if (placements.size > 0) {
      const art = method.perPlacement * placements.size
      unitPrint += art
      lines.push({
        label: method.label,
        detail: `${placements.size} placement${placements.size > 1 ? 's' : ''} x ${qty}`,
        amount: art * qty,
      })

      if (method.setupFee > 0) {
        setup = method.setupFee * placements.size
        lines.push({ label: 'Setup', detail: 'one-off per order', amount: setup })
      }
    }

    if (customization.teamName.trim()) {
      unitPrint += TEAM_NAME_PRICE
      lines.push({ label: 'Team wordmark', detail: `${qty} x`, amount: TEAM_NAME_PRICE * qty })
    }

    // Name and number are priced on the roster entries that actually carry
    // them — a squad where only half the shirts are numbered pays for half.
    const named = customization.roster.filter((r) => r.playerName.trim())
    const numbered = customization.roster.filter((r) => r.number.trim())
    const namedUnits = named.reduce((n, r) => n + r.quantity, 0)
    const numberedUnits = numbered.reduce((n, r) => n + r.quantity, 0)

    if (namedUnits > 0) {
      lines.push({ label: 'Player names', detail: `${namedUnits} x`, amount: NAME_PRICE * namedUnits })
    }
    if (numberedUnits > 0) {
      lines.push({ label: 'Numbers', detail: `${numberedUnits} x`, amount: NUMBER_PRICE * numberedUnits })
    }

    // Fold the roster surcharges into the per-unit figure so the headline
    // "from $X each" stays honest even when the roster is mixed.
    const rosterTotal = NAME_PRICE * namedUnits + NUMBER_PRICE * numberedUnits
    unitPrint += qty > 0 ? Math.round(rosterTotal / qty) : 0
  }

  const grossSubtotal = (basePrice + unitPrint) * qty
  const { discount: discountRate } = tierFor(qty)
  const discount = Math.round(grossSubtotal * discountRate)

  if (discount > 0) {
    lines.push({
      label: `Volume break`,
      detail: `${qty}+ units, -${Math.round(discountRate * 100)}%`,
      amount: -discount,
    })
  }

  return {
    unitBase: basePrice,
    unitPrint,
    setup,
    quantity: qty,
    grossSubtotal,
    discountRate,
    discount,
    lineTotal: grossSubtotal - discount + setup,
    lines,
  }
}

/* --- order level ---------------------------------------------------------- */

export const SHIPPING_METHODS = {
  standard: { id: 'standard', label: 'Standard', days: '5-7 working days', price: 0, freeOver: 0 },
  express: { id: 'express', label: 'Express', days: '2-3 working days', price: 1400, freeOver: 25000 },
  rush: { id: 'rush', label: 'Rush production', days: '24h on the floor, next-day ship', price: 4500, freeOver: 0 },
} as const

export type ShippingMethodId = keyof typeof SHIPPING_METHODS

export const TAX_RATE = 0.08

export function shippingCost(method: ShippingMethodId, subtotal: number) {
  const m = SHIPPING_METHODS[method]
  if (m.freeOver > 0 && subtotal >= m.freeOver) return 0
  return m.price
}

export function orderTotals(lineTotals: number[], method: ShippingMethodId) {
  const subtotal = lineTotals.reduce((a, b) => a + b, 0)
  const shipping = shippingCost(method, subtotal)
  const tax = Math.round(subtotal * TAX_RATE)
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}
