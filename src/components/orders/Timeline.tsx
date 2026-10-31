'use client'

import { motion } from 'motion/react'
import { Check, CircleDashed, X } from 'lucide-react'
import { ORDER_STATUSES, STATUS_FLOW, statusIndex, type OrderStatus } from '@/lib/orders'
import { cn, formatDateTime } from '@/lib/utils'

export type TimelineEvent = { status: string; note: string | null; createdAt: string | Date }

/**
 * The production timeline.
 *
 * Customers are shown the stage their order is actually at on the floor —
 * proofing, press, cut-and-sew, QC — rather than a carrier tracking number
 * that says nothing for five days. Stages already logged carry their real
 * timestamp; the rest are drawn as pending.
 */
export function Timeline({ status, events }: { status: string; events: TimelineEvent[] }) {
  if (status === 'cancelled') {
    const cancelled = events.find((e) => e.status === 'cancelled')
    return (
      <div className="flex items-start gap-3.5 rounded-lg border border-danger/25 bg-danger/5 p-5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger text-white">
          <X className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="font-medium">{ORDER_STATUSES.cancelled.label}</p>
          <p className="mt-1 text-sm text-carbon-600">{ORDER_STATUSES.cancelled.customerNote}</p>
          {cancelled ? (
            <p className="tabular mt-2 text-xs text-carbon-500">
              {formatDateTime(cancelled.createdAt)}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  const current = statusIndex(status)
  const byStatus = new Map(events.map((e) => [e.status, e]))

  return (
    <ol className="relative">
      {STATUS_FLOW.map((s, i) => {
        const meta = ORDER_STATUSES[s as OrderStatus]
        const event = byStatus.get(s)
        const done = i < current
        const active = i === current
        const last = i === STATUS_FLOW.length - 1

        return (
          <li key={s} className="relative flex gap-4 pb-7 last:pb-0">
            {/* Connector. Drawn behind the marker, stopping at the last row. */}
            {!last ? (
              <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-carbon-200">
                <motion.span
                  className="block w-full bg-field-700"
                  initial={{ height: 0 }}
                  animate={{ height: done ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            ) : null}

            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors',
                done && 'border-field-700 bg-field-700 text-chalk',
                active && 'border-carbon-900 bg-carbon-900 text-chalk',
                !done && !active && 'border-carbon-200 bg-chalk text-carbon-300',
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : active ? (
                <span className="h-2 w-2 animate-shimmer rounded-full bg-chalk" />
              ) : (
                <CircleDashed className="h-3.5 w-3.5" />
              )}
            </motion.span>

            <div className={cn('min-w-0 pt-0.5', !done && !active && 'opacity-45')}>
              <p className={cn('text-sm', active ? 'font-medium' : 'font-normal')}>{meta.label}</p>
              {active ? (
                <p className="mt-1 text-[13px] leading-relaxed text-carbon-600">
                  {meta.customerNote}
                </p>
              ) : null}
              {event ? (
                <p className="tabular mt-1 text-xs text-carbon-500">
                  {formatDateTime(event.createdAt)}
                  {event.note && event.note !== meta.label ? ` · ${event.note}` : ''}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
