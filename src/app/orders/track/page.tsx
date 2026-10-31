'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowRight, Loader2, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { ORDER_STATUSES, STATUS_FLOW } from '@/lib/orders'

export default function TrackPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setChecking(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const number = String(form.get('number') ?? '').trim().toUpperCase()
    const email = String(form.get('email') ?? '').trim().toLowerCase()

    // Verify before navigating, so a wrong reference produces an inline error
    // rather than bouncing the user to a 404 and back.
    const res = await fetch(`/api/orders/${encodeURIComponent(number)}?email=${encodeURIComponent(email)}`)

    if (!res.ok) {
      setError(
        'No order matches that reference and email. Check both — the reference is in your confirmation email.',
      )
      setChecking(false)
      return
    }

    router.push(`/orders/${number}?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="gutter py-14 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-field-700 text-chalk">
            <PackageSearch className="h-5 w-5" />
          </span>

          <h1 className="text-display-lg mt-6 font-display font-bold">Track an order</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-carbon-600">
            There are no accounts here. Your order reference plus the email it was placed with is
            all you need — and it shows the stage the order is actually at on the floor, not just
            whether a courier has scanned it.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field
              label="Order reference"
              htmlFor="number"
              required
              hint="Looks like ATH-7K2M-4QX9."
            >
              <Input
                id="number"
                name="number"
                required
                placeholder="ATH-0000-0000"
                autoComplete="off"
                spellCheck={false}
                className="tabular uppercase"
              />
            </Field>

            <Field label="Email on the order" htmlFor="email" required error={error ?? undefined}>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="coach@club.org"
                autoComplete="email"
                aria-invalid={!!error}
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="animate-spin" />
                  Looking it up
                </>
              ) : (
                <>
                  Find my order
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>

          {/* Demo affordance — without a seeded reference there is nothing to
              look at on a fresh clone. */}
          <div className="mt-8 rounded-lg border border-dashed border-carbon-300 p-4">
            <p className="eyebrow mb-2 text-carbon-500">Demo orders</p>
            <ul className="space-y-1.5 text-xs text-carbon-600">
              <li className="tabular">
                ATH-DEMO-KIT1 · coach@northgaterovers.example
              </li>
              <li className="tabular">ATH-DEMO-HOOD · ops@benchpressclub.example</li>
            </ul>
          </div>
        </div>

        {/* --- what the stages mean --------------------------------------- */}
        <div className="rounded-xl border border-carbon-200 bg-white p-7">
          <h2 className="font-display text-lg font-bold">What the stages mean</h2>
          <p className="mt-2 text-sm text-carbon-500">
            Every order moves through the same seven steps.
          </p>

          <ol className="mt-6 space-y-5">
            {STATUS_FLOW.map((s, i) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-4"
              >
                <span className="tabular mt-0.5 shrink-0 font-mono text-xs text-carbon-300">
                  0{i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{ORDER_STATUSES[s].label}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-carbon-500">
                    {ORDER_STATUSES[s].customerNote}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
