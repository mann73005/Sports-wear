import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Mail, MapPin, Truck } from 'lucide-react'
import { db } from '@/lib/db'
import { ORDER_STATUSES, estimateDelivery, type OrderStatus } from '@/lib/orders'
import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/pricing'
import { formatDate, formatMoney } from '@/lib/utils'
import { Timeline } from '@/components/orders/Timeline'
import { SpecSheet } from '@/components/orders/SpecSheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/misc'
import { PlacedBanner } from './PlacedBanner'

export const metadata: Metadata = { title: 'Your order', robots: { index: false } }

type Params = Promise<{ number: string }>
type Search = Promise<{ email?: string; placed?: string }>

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { number } = await params
  const { email, placed } = await searchParams

  const order = await db.order.findUnique({
    where: { number: number.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: 'asc' } } },
  })

  // The reference alone is not enough — the email it was placed with has to
  // match. Same 404 either way, so this page can't confirm a reference exists.
  if (!order || !email || order.email !== email.toLowerCase().trim()) notFound()

  const meta = ORDER_STATUSES[order.status as OrderStatus]
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethodId]
  const eta = estimateDelivery(order.createdAt, order.shippingMethod)
  const units = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="gutter py-10 lg:py-14">
      {placed ? <PlacedBanner email={order.email} /> : null}

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-carbon-500">Order reference</p>
          <h1 className="tabular text-display-md mt-2 font-display font-bold">{order.number}</h1>
          <p className="mt-2 text-sm text-carbon-500">
            Placed {formatDate(order.createdAt)} · {order.items.length} line
            {order.items.length === 1 ? '' : 's'} · {units} garment{units === 1 ? '' : 's'}
          </p>
        </div>

        <div className="text-right">
          <Badge
            variant={
              meta.tone === 'good' ? 'ok' : meta.tone === 'bad' ? 'danger' : 'default'
            }
          >
            {meta.label}
          </Badge>
          <p className="tabular mt-3 font-display text-2xl font-bold">
            {formatMoney(order.total)}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="space-y-10">
          <section>
            <h2 className="font-display mb-5 text-lg font-bold">Progress</h2>
            <div className="rounded-xl border border-carbon-200 bg-white p-6">
              <Timeline
                status={order.status}
                events={order.events.map((e) => ({
                  status: e.status,
                  note: e.note,
                  createdAt: e.createdAt,
                }))}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display mb-5 text-lg font-bold">
              What is being made
              <span className="ml-2 text-xs font-normal text-carbon-500">
                exactly as you approved it
              </span>
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <SpecSheet key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>

        {/* --- aside ------------------------------------------------------ */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {order.status !== 'cancelled' && order.status !== 'delivered' ? (
            <div className="rounded-xl bg-field-700 p-5 text-chalk">
              <p className="eyebrow text-field-300">Expected delivery</p>
              <p className="font-display mt-2 text-lg font-bold">
                {formatDate(eta.from)} – {formatDate(eta.to)}
              </p>
              <p className="mt-2 text-xs text-field-300">
                {shipping.label} · {shipping.days}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-carbon-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold">Delivering to</h3>
            <address className="mt-3 space-y-0.5 text-[13px] not-italic leading-relaxed text-carbon-600">
              <p className="font-medium text-carbon-900">{order.name}</p>
              <p>{order.addressLine1}</p>
              {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
              <p>
                {order.city}, {order.region} {order.postcode}
              </p>
              <p>{order.country}</p>
            </address>

            <Separator className="my-4" />

            <ul className="space-y-2.5 text-[13px] text-carbon-600">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-carbon-400" />
                <span className="break-all">{order.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-carbon-400" />
                {shipping.label}
              </li>
              {order.notes ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-carbon-400" />
                  {order.notes}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-carbon-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold">Payment</h3>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-carbon-600">Garments</dt>
                <dd className="tabular">{formatMoney(order.subtotal - order.printTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Print work</dt>
                <dd className="tabular">{formatMoney(order.printTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Shipping</dt>
                <dd className="tabular">
                  {order.shipping === 0 ? 'Free' : formatMoney(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Tax</dt>
                <dd className="tabular">{formatMoney(order.tax)}</dd>
              </div>
            </dl>
            <Separator className="my-3" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span className="tabular">{formatMoney(order.total)}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/shop">
              Order something else
              <ArrowRight />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}
