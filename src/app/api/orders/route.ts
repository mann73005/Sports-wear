import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkoutSchema, type CheckoutItem } from '@/lib/order-schema'
import { orderTotals, priceLine } from '@/lib/pricing'
import { generateOrderNumber } from '@/lib/utils'

/**
 * POST /api/orders — place an order.
 *
 * The browser sends what was chosen, never what it costs. Every line is
 * re-priced here from the product row plus the submitted spec using the same
 * engine the studio runs, so a tampered payload buys nothing cheaply and the
 * figures on the order always reconcile.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Those details are not valid',
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 422 },
    )
  }

  const payload = parsed.data

  // One query for every product referenced, rather than one per line.
  const products = await db.product.findMany({
    where: { id: { in: [...new Set(payload.items.map((i) => i.productId))] } },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  const missing = payload.items.filter((i) => !byId.has(i.productId))
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Some items are no longer available', missing: missing.map((m) => m.productId) },
      { status: 409 },
    )
  }

  /** A roster defines its own garment count; otherwise trust the quantity. */
  const unitsFor = (item: CheckoutItem) => {
    const roster = item.customization?.roster ?? []
    return roster.length > 0 ? roster.reduce((n, r) => n + r.quantity, 0) : item.quantity
  }

  const lines = payload.items.map((item) => {
    const product = byId.get(item.productId)!
    const units = unitsFor(item)
    const price = priceLine(product.basePrice, item.customization, units)

    return {
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      sku: product.sku,
      category: product.category,
      size: item.size,
      colorName: item.colorName,
      bodyHex: item.bodyHex,
      accentHex: item.accentHex,
      trimHex: item.trimHex,
      quantity: units,
      unitPrice: product.basePrice,
      printCost: price.unitPrint,
      lineTotal: price.lineTotal,
      customization: item.customization ? JSON.stringify(item.customization) : null,
      // Not persisted — used to roll up the order below.
      _printTotal: price.unitPrint * units + price.setup,
    }
  })

  const { subtotal, shipping, tax, total } = orderTotals(
    lines.map((l) => l.lineTotal),
    payload.shippingMethod,
  )
  const printTotal = lines.reduce((n, l) => n + l._printTotal, 0)

  // Collisions are vanishingly unlikely with a 31^8 keyspace, but an order
  // reference that silently overwrites another is not a failure mode worth
  // leaving open.
  let number = generateOrderNumber()
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await db.order.findUnique({ where: { number }, select: { id: true } })
    if (!clash) break
    number = generateOrderNumber()
  }

  const order = await db.order.create({
    data: {
      number,
      email: payload.email.toLowerCase().trim(),
      name: payload.name.trim(),
      phone: payload.phone?.trim() || null,
      addressLine1: payload.addressLine1.trim(),
      addressLine2: payload.addressLine2?.trim() || null,
      city: payload.city.trim(),
      region: payload.region.trim(),
      postcode: payload.postcode.trim(),
      country: payload.country.trim(),
      shippingMethod: payload.shippingMethod,
      subtotal,
      printTotal,
      shipping,
      tax,
      total,
      status: 'received',
      notes: payload.notes?.trim() || null,
      items: {
        create: lines.map(({ _printTotal, ...line }) => line),
      },
      events: {
        create: { status: 'received', note: 'Order placed' },
      },
    },
    select: { number: true, total: true, email: true },
  })

  return NextResponse.json(order, { status: 201 })
}

/**
 * GET /api/orders — the production queue.
 *
 * Demo-only: a real deployment would put this behind staff authentication.
 * It is referenced by the admin console, which is explicitly an internal view.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q')?.trim()

  const orders = await db.order.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(q
        ? {
            OR: [
              { number: { contains: q } },
              { email: { contains: q } },
              { name: { contains: q } },
            ],
          }
        : {}),
    },
    include: { items: { select: { id: true, name: true, quantity: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(orders)
}
