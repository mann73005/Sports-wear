import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { statusPatchSchema } from '@/lib/order-schema'
import { ORDER_STATUSES } from '@/lib/orders'

type Ctx = { params: Promise<{ number: string }> }

/**
 * GET /api/orders/:number?email=... — look an order up.
 *
 * There are no accounts here, so the order reference alone is the credential.
 * A reference is guessable in principle, so the email on the order has to
 * match too: knowing one without the other gets you nothing. Both failures
 * return the same 404 so the endpoint can't be used to test whether a
 * reference exists.
 */
export async function GET(request: Request, { params }: Ctx) {
  const { number } = await params
  const email = new URL(request.url).searchParams.get('email')?.toLowerCase().trim()

  // Checked before the lookup on purpose. If a missing email were handled
  // after it, an existing reference would answer 400 while a bogus one
  // answered 404 — and that difference is an oracle for enumerating valid
  // references without knowing a single email address.
  if (!email) {
    return NextResponse.json({ error: 'An email address is required' }, { status: 400 })
  }

  const order = await db.order.findUnique({
    where: { number: number.toUpperCase() },
    include: {
      items: true,
      events: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order || order.email !== email) {
    return NextResponse.json({ error: 'No order matches that reference' }, { status: 404 })
  }

  return NextResponse.json(order)
}

/**
 * PATCH /api/orders/:number — advance an order through production.
 *
 * Demo-only: staff authentication would gate this in a real deployment.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const { number } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 })
  }

  const parsed = statusPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Unknown status' }, { status: 422 })
  }

  const order = await db.order.findUnique({
    where: { number: number.toUpperCase() },
    select: { id: true, status: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'No order matches that reference' }, { status: 404 })
  }
  if (order.status === parsed.data.status) {
    return NextResponse.json({ error: 'The order is already at that stage' }, { status: 409 })
  }

  // The event log is the source of truth; Order.status is a cache of the
  // newest event so the queue view doesn't have to join on every row.
  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      status: parsed.data.status,
      events: {
        create: {
          status: parsed.data.status,
          note: parsed.data.note ?? ORDER_STATUSES[parsed.data.status].label,
        },
      },
    },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  })

  return NextResponse.json(updated)
}
