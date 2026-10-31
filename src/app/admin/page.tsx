import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Inbox } from 'lucide-react'
import { db } from '@/lib/db'
import { ORDER_STATUSES, STATUS_FLOW, type OrderStatus } from '@/lib/orders'
import { cn, formatDate, formatMoney } from '@/lib/utils'
import { parseCustomization } from '@/lib/customization'

export const metadata: Metadata = { title: 'Production queue', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Search = Promise<{ status?: string }>

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
  const { status } = await searchParams
  const filter = status && status !== 'all' ? status : undefined

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: filter ? { status: filter } : {},
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.order.groupBy({ by: ['status'], _count: { _all: true }, _sum: { total: true } }),
  ])

  const countFor = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0
  const total = counts.reduce((n, c) => n + c._count._all, 0)

  // Anything still on the floor — the number the shift actually cares about.
  const openValue = counts
    .filter((c) => !['delivered', 'cancelled'].includes(c.status))
    .reduce((n, c) => n + (c._sum.total ?? 0), 0)
  const openCount = counts
    .filter((c) => !['delivered', 'cancelled'].includes(c.status))
    .reduce((n, c) => n + c._count._all, 0)

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-chalk">Production queue</h1>
          <p className="mt-1.5 text-sm text-carbon-500">
            {total} order{total === 1 ? '' : 's'} on record · {openCount} still on the floor
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-carbon-500">Open value</p>
          <p className="tabular font-display mt-1 text-2xl font-bold text-chalk">
            {formatMoney(openValue)}
          </p>
        </div>
      </header>

      {/* --- status filter ------------------------------------------------ */}
      <nav className="no-scrollbar mt-7 flex gap-1.5 overflow-x-auto" aria-label="Filter by status">
        <FilterChip href="/admin" label="All" count={total} active={!filter} />
        {[...STATUS_FLOW, 'cancelled' as const].map((s) => (
          <FilterChip
            key={s}
            href={`/admin?status=${s}`}
            label={ORDER_STATUSES[s as OrderStatus].label}
            count={countFor(s)}
            active={filter === s}
          />
        ))}
      </nav>

      {/* --- table -------------------------------------------------------- */}
      {orders.length === 0 ? (
        <div className="mt-8 grid-paper-dark rounded-lg border border-carbon-800 py-20 text-center">
          <Inbox className="mx-auto h-6 w-6 text-carbon-600" />
          <p className="mt-3 text-sm text-carbon-400">Nothing at this stage.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-carbon-800">
          <table className="w-full min-w-[840px] text-sm">
            <caption className="sr-only">Orders in the production queue</caption>
            <thead>
              <tr className="border-b border-carbon-800 bg-carbon-900">
                {['Reference', 'Customer', 'Contents', 'Placed', 'Stage', 'Value', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={cn(
                      'eyebrow px-4 py-3 text-left text-carbon-500',
                      ['Value'].includes(h) && 'text-right',
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const meta = ORDER_STATUSES[o.status as OrderStatus]
                const units = o.items.reduce((n, i) => n + i.quantity, 0)
                const customLines = o.items.filter((i) => i.customization).length
                // Surface a floor note on the queue row — it is the thing an
                // operator most needs to see before they start the job.
                const hasNote = o.items.some((i) => parseCustomization(i.customization)?.notes)

                return (
                  <tr
                    key={o.id}
                    className="border-b border-carbon-850 transition-colors last:border-0 hover:bg-carbon-900"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.number}`}
                        className="tabular font-medium text-chalk hover:text-field-400"
                      >
                        {o.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-carbon-200">{o.name}</p>
                      <p className="text-xs text-carbon-500">{o.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="tabular text-carbon-300">
                        {units} piece{units === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-carbon-500">
                        {customLines > 0 ? `${customLines} custom` : 'stock only'}
                        {hasNote ? <span className="ml-1.5 text-warn">· note</span> : null}
                      </p>
                    </td>
                    <td className="tabular px-4 py-3 text-carbon-400">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-xs px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
                          meta.tone === 'good' && 'bg-ok/15 text-ok',
                          meta.tone === 'bad' && 'bg-danger/15 text-danger',
                          meta.tone === 'active' && 'bg-field-400/15 text-field-300',
                          meta.tone === 'neutral' && 'bg-carbon-800 text-carbon-300',
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="tabular px-4 py-3 text-right text-chalk">
                      {formatMoney(o.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.number}`}
                        className="inline-grid h-7 w-7 place-items-center rounded-xs text-carbon-500 transition-colors hover:bg-carbon-800 hover:text-chalk"
                        aria-label={`Open ${o.number}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count: number
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'shrink-0 rounded-sm border px-3 py-1.5 text-[13px] transition-colors',
        active
          ? 'border-chalk bg-chalk text-carbon-900'
          : 'border-carbon-800 text-carbon-400 hover:border-carbon-600 hover:text-chalk',
      )}
    >
      {label}
      <span className={cn('tabular ml-1.5 text-[11px]', active ? 'text-carbon-500' : 'text-carbon-600')}>
        {count}
      </span>
    </Link>
  )
}
