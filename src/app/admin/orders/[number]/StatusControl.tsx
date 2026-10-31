'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, Ban, Loader2 } from 'lucide-react'
import { ORDER_STATUSES, nextStatus, type OrderStatus } from '@/lib/orders'
import { cn } from '@/lib/utils'

/**
 * Advance an order along the production flow.
 *
 * Deliberately one forward step at a time plus an explicit cancel: an
 * operator marking an order "dispatched" straight from "received" is almost
 * always a misclick, and the event log is what the customer-facing timeline
 * is built from.
 */
export function StatusControl({ number, status }: { number: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const next = nextStatus(status)
  const terminal = status === 'cancelled' || status === 'delivered'

  async function move(to: OrderStatus) {
    setBusy(to)
    try {
      const res = await fetch(`/api/orders/${number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Could not update the order')
        return
      }

      toast.success(`Moved to ${ORDER_STATUSES[to].label}`)
      // The page is a server component reading the DB; refresh re-renders it
      // with the new event already in the timeline.
      router.refresh()
    } catch {
      toast.error('Network error', { description: 'The order was not updated.' })
    } finally {
      setBusy(null)
    }
  }

  if (terminal) {
    return (
      <p className="rounded-sm border border-carbon-800 bg-carbon-900 px-3.5 py-3 text-xs text-carbon-400">
        This order is {ORDER_STATUSES[status as OrderStatus].label.toLowerCase()}. There is
        nothing further to advance.
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {next ? (
        <button
          onClick={() => move(next)}
          disabled={busy !== null}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-sm bg-chalk px-4 py-3 text-sm font-medium text-carbon-900 transition-all',
            'hover:bg-white active:scale-[0.99] disabled:opacity-50',
          )}
        >
          <span className="text-left">
            <span className="block">Advance to {ORDER_STATUSES[next].label}</span>
            <span className="mt-0.5 block text-xs font-normal text-carbon-500">
              {ORDER_STATUSES[next].customerNote}
            </span>
          </span>
          {busy === next ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 shrink-0" />
          )}
        </button>
      ) : null}

      <button
        onClick={() => move('cancelled')}
        disabled={busy !== null}
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-danger/40 px-4 py-2.5 text-xs text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
      >
        {busy === 'cancelled' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Ban className="h-3.5 w-3.5" />
        )}
        Cancel this order
      </button>
    </div>
  )
}
