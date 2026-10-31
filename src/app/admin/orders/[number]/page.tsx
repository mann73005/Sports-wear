import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { db } from '@/lib/db'
import { ORDER_STATUSES, estimateDelivery, type OrderStatus } from '@/lib/orders'
import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/pricing'
import { PRINT_METHODS, parseCustomization } from '@/lib/customization'
import { cn, formatDate, formatDateTime, formatMoney } from '@/lib/utils'
import { SpecSheet } from '@/components/orders/SpecSheet'
import { StatusControl } from './StatusControl'

export const metadata: Metadata = { title: 'Order detail', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Params = Promise<{ number: string }>

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { number } = await params

  const order = await db.order.findUnique({
    where: { number: number.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
  })
  if (!order) notFound()

  const meta = ORDER_STATUSES[order.status as OrderStatus]
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethodId]
  const eta = estimateDelivery(order.createdAt, order.shippingMethod)
  const units = order.items.reduce((n, i) => n + i.quantity, 0)

  // Roll the lines up into a work summary: which presses this job needs.
  const methods = new Map<string, number>()
  for (const item of order.items) {
    const spec = parseCustomization(item.customization)
    if (!spec) continue
    const placements = new Set(spec.artwork.map((a) => a.placement)).size
    methods.set(spec.method, (methods.get(spec.method) ?? 0) + Math.max(1, placements))
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-carbon-500 transition-colors hover:text-chalk"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to the queue
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="tabular font-display text-2xl font-bold text-chalk">{order.number}</h1>
          <p className="mt-1.5 text-sm text-carbon-500">
            {order.name} · {order.email} · placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              'rounded-xs px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]',
              meta.tone === 'good' && 'bg-ok/15 text-ok',
              meta.tone === 'bad' && 'bg-danger/15 text-danger',
              meta.tone === 'active' && 'bg-field-400/15 text-field-300',
              meta.tone === 'neutral' && 'bg-carbon-800 text-carbon-300',
            )}
          >
            {meta.label}
          </span>
          <p className="tabular font-display text-2xl font-bold text-chalk">
            {formatMoney(order.total)}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* --- the job ---------------------------------------------------- */}
        <div className="space-y-6">
          <section>
            <h2 className="eyebrow mb-3 text-carbon-500">
              Work sheet · {order.items.length} line{order.items.length === 1 ? '' : 's'} ·{' '}
              {units} garment{units === 1 ? '' : 's'}
            </h2>
            {/* SpecSheet is the same component the customer sees, on purpose:
                one artefact, so approval and production cannot diverge. */}
            <div className="space-y-3 [&_*]:text-carbon-900">
              {order.items.map((item) => (
                <SpecSheet key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3 text-carbon-500">Event log</h2>
            <div className="overflow-hidden rounded-lg border border-carbon-800">
              <table className="w-full text-sm">
                <caption className="sr-only">Status history for {order.number}</caption>
                <thead>
                  <tr className="border-b border-carbon-800 bg-carbon-900">
                    {['When', 'Stage', 'Note'].map((h) => (
                      <th key={h} scope="col" className="eyebrow px-4 py-2.5 text-left text-carbon-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.events.map((e) => (
                    <tr key={e.id} className="border-b border-carbon-850 last:border-0">
                      <td className="tabular whitespace-nowrap px-4 py-2.5 text-carbon-400">
                        {formatDateTime(e.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 text-carbon-200">
                        {ORDER_STATUSES[e.status as OrderStatus]?.label ?? e.status}
                      </td>
                      <td className="px-4 py-2.5 text-carbon-500">{e.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* --- controls --------------------------------------------------- */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-carbon-800 bg-carbon-900 p-5">
            <h2 className="eyebrow mb-3.5 text-carbon-500">Advance</h2>
            <StatusControl number={order.number} status={order.status} />
          </div>

          {methods.size > 0 ? (
            <div className="rounded-lg border border-carbon-800 bg-carbon-900 p-5">
              <h2 className="eyebrow mb-3 text-carbon-500">Presses needed</h2>
              <ul className="space-y-2 text-[13px]">
                {[...methods.entries()].map(([m, n]) => (
                  <li key={m} className="flex justify-between gap-3">
                    <span className="text-carbon-300">
                      {PRINT_METHODS[m as keyof typeof PRINT_METHODS].label}
                    </span>
                    <span className="tabular shrink-0 text-carbon-500">
                      {n} placement{n === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-carbon-800 bg-carbon-900 p-5">
            <h2 className="eyebrow mb-3 text-carbon-500">Ship to</h2>
            <address className="space-y-0.5 text-[13px] not-italic leading-relaxed text-carbon-400">
              <p className="font-medium text-carbon-200">{order.name}</p>
              <p>{order.addressLine1}</p>
              {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
              <p>
                {order.city}, {order.region} {order.postcode}
              </p>
              <p>{order.country}</p>
              {order.phone ? <p className="tabular pt-1">{order.phone}</p> : null}
            </address>

            <dl className="mt-4 space-y-2 border-t border-carbon-800 pt-4 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-carbon-500">Service</dt>
                <dd className="text-right text-carbon-300">{shipping.label}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-carbon-500">Promised</dt>
                <dd className="tabular text-right text-carbon-300">
                  {formatDate(eta.from)}–{formatDate(eta.to)}
                </dd>
              </div>
            </dl>

            {order.notes ? (
              <p className="mt-4 rounded-sm bg-warn/10 p-3 text-xs leading-relaxed text-warn">
                {order.notes}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-carbon-800 bg-carbon-900 p-5">
            <h2 className="eyebrow mb-3 text-carbon-500">Invoice</h2>
            <dl className="space-y-2 text-[13px]">
              {[
                ['Garments', order.subtotal - order.printTotal],
                ['Print work', order.printTotal],
                ['Shipping', order.shipping],
                ['Tax', order.tax],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-carbon-500">{k}</dt>
                  <dd className="tabular text-carbon-300">{formatMoney(v as number)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex justify-between border-t border-carbon-800 pt-3 text-sm font-medium text-chalk">
              <span>Total</span>
              <span className="tabular">{formatMoney(order.total)}</span>
            </div>
          </div>

          <Link
            href={`/orders/${order.number}?email=${encodeURIComponent(order.email)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-carbon-800 px-4 py-2.5 text-xs text-carbon-400 transition-colors hover:border-carbon-600 hover:text-chalk"
          >
            View as the customer sees it
            <ExternalLink className="h-3 w-3" />
          </Link>
        </aside>
      </div>
    </div>
  )
}
