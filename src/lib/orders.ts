/* ===========================================================================
   Order lifecycle.

   An ATHLON order is a manufacturing job, not a parcel pulled off a shelf, so
   the timeline the customer sees mirrors the actual floor: artwork is proofed,
   then printed, then the garment is assembled, inspected and shipped.
   =========================================================================== */

export const ORDER_STATUSES = {
  received: {
    id: 'received',
    label: 'Order received',
    customerNote: 'We have your order. Artwork goes to the studio next.',
    tone: 'neutral',
  },
  artwork: {
    id: 'artwork',
    label: 'Artwork proofing',
    customerNote: 'A studio operator is checking your print files against the garment.',
    tone: 'neutral',
  },
  printing: {
    id: 'printing',
    label: 'Printing',
    customerNote: 'Your design is on the press.',
    tone: 'active',
  },
  stitching: {
    id: 'stitching',
    label: 'Cut & sew',
    customerNote: 'Panels are being assembled into finished garments.',
    tone: 'active',
  },
  qc: {
    id: 'qc',
    label: 'Quality control',
    customerNote: 'Every piece is checked against the spec before it leaves.',
    tone: 'active',
  },
  dispatched: {
    id: 'dispatched',
    label: 'Dispatched',
    customerNote: 'On its way. Tracking has been emailed to you.',
    tone: 'good',
  },
  delivered: {
    id: 'delivered',
    label: 'Delivered',
    customerNote: 'Delivered. Thirty days to return if the fit is wrong.',
    tone: 'good',
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    customerNote: 'This order was cancelled. Any payment has been refunded.',
    tone: 'bad',
  },
} as const

export type OrderStatus = keyof typeof ORDER_STATUSES

/** The happy path, in order. `cancelled` is deliberately not on it. */
export const STATUS_FLOW: OrderStatus[] = [
  'received',
  'artwork',
  'printing',
  'stitching',
  'qc',
  'dispatched',
  'delivered',
]

export function statusIndex(status: string) {
  return STATUS_FLOW.indexOf(status as OrderStatus)
}

export function nextStatus(status: string): OrderStatus | null {
  const i = statusIndex(status)
  if (i === -1 || i === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[i + 1]
}

export function isValidStatus(s: string): s is OrderStatus {
  return s in ORDER_STATUSES
}

/**
 * Promised delivery window. Rush jumps the production queue, so it is costed
 * from a one-day floor time rather than the standard five.
 */
export function estimateDelivery(placedAt: Date, method: string) {
  const productionDays = method === 'rush' ? 1 : 5
  const transitDays = method === 'standard' ? 6 : method === 'express' ? 3 : 1

  const from = new Date(placedAt)
  from.setDate(from.getDate() + productionDays + transitDays)
  const to = new Date(from)
  to.setDate(to.getDate() + 2)
  return { from, to }
}
