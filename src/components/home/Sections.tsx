'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, PackageSearch } from 'lucide-react'
import { PRINT_METHODS } from '@/lib/customization'
import { QUANTITY_TIERS } from '@/lib/pricing'
import { CATEGORY_LABELS } from '@/lib/catalog.shared'
import { Garment } from '@/art/Garment'
import type { GarmentType } from '@/art/garment-paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMoney } from '@/lib/utils'

/* --- print methods -------------------------------------------------------- */

export function Methods() {
  const methods = Object.values(PRINT_METHODS)

  return (
    <section id="methods" className="border-y border-carbon-200 bg-carbon-950 py-20 text-chalk lg:py-28">
      <div className="gutter">
        <header className="max-w-2xl">
          <p className="eyebrow text-carbon-500">[ 02 ] On the floor</p>
          <h2 className="text-display-lg mt-4 font-display font-bold">
            Four ways to put
            <br />
            <span className="text-carbon-600">ink on fabric.</span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-carbon-400">
            They are not interchangeable. Each one behaves differently on different fabrics, at
            different run lengths, with different artwork. The studio recommends one — this is
            why.
          </p>
        </header>

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg bg-carbon-800 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-carbon-950 p-7 transition-colors duration-300 hover:bg-carbon-900"
            >
              <span className="tabular text-xs text-carbon-600">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{m.label}</h3>
              <p className="mt-3 min-h-[72px] text-[13px] leading-relaxed text-carbon-400">
                {m.note}
              </p>

              <dl className="mt-5 space-y-2 border-t border-carbon-800 pt-4 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-carbon-500">Best for</dt>
                  <dd className="text-right text-carbon-300">{m.bestFor}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-carbon-500">Per placement</dt>
                  <dd className="tabular text-carbon-300">{formatMoney(m.perPlacement)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-carbon-500">Setup</dt>
                  <dd className="tabular text-carbon-300">
                    {m.setupFee === 0 ? 'None' : formatMoney(m.setupFee)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-carbon-500">Colours</dt>
                  <dd className="tabular text-carbon-300">
                    {m.maxColors === Infinity ? 'Unlimited' : `Up to ${m.maxColors}`}
                  </dd>
                </div>
              </dl>

              <span className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-field-500 transition-transform duration-400 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- categories ----------------------------------------------------------- */

const CATEGORY_TILES: { category: GarmentType; body: string; accent: string; trim: string }[] = [
  { category: 'jersey', body: '#0e4234', accent: '#0b3326', trim: '#e8e5dc' },
  { category: 'hoodie', body: '#1b1f21', accent: '#1b1f21', trim: '#2b2f32' },
  { category: 'tee', body: '#f4f2ed', accent: '#f4f2ed', trim: '#d9dbd6' },
  { category: 'tights', body: '#1b1f21', accent: '#1b1f21', trim: '#2b2f32' },
  { category: 'jacket', body: '#1b3fa8', accent: '#14307e', trim: '#f1efe8' },
  { category: 'shorts', body: '#e8552f', accent: '#e8552f', trim: '#15181a' },
  { category: 'tank', body: '#0e4234', accent: '#0e4234', trim: '#f1efe8' },
  { category: 'cap', body: '#8a5a44', accent: '#6f4634', trim: '#cfcabd' },
]

export function Categories() {
  return (
    <section className="gutter py-20 lg:py-28">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-carbon-500">[ 03 ] The shelf</p>
          <h2 className="text-display-lg mt-4 font-display font-bold">Every blank we print on.</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/shop">
            All kit
            <ArrowRight />
          </Link>
        </Button>
      </header>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORY_TILES.map((t, i) => (
          <motion.div
            key={t.category}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/shop?category=${t.category}`}
              className="group relative block aspect-square overflow-hidden rounded-lg bg-carbon-100 transition-colors duration-400 hover:bg-carbon-200/80"
            >
              <div className="grid-paper absolute inset-0 opacity-50" aria-hidden />
              <div className="absolute inset-0 p-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-2">
                <Garment
                  type={t.category}
                  bodyHex={t.body}
                  accentHex={t.accent}
                  trimHex={t.trim}
                  shadow={false}
                />
              </div>
              <span className="absolute bottom-3 left-3 text-[13px] font-medium">
                {CATEGORY_LABELS[t.category]}
              </span>
              <ArrowRight className="absolute bottom-3.5 right-3 h-3.5 w-3.5 -translate-x-1 text-carbon-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* --- team / volume -------------------------------------------------------- */

export function TeamPricing() {
  return (
    <section id="volume" className="gutter py-20 lg:py-28">
      <div className="grid overflow-hidden rounded-xl border border-carbon-200 bg-white lg:grid-cols-2">
        <div className="p-8 lg:p-14">
          <Badge variant="brand">Clubs & teams</Badge>
          <h2 className="text-display-md mt-5 font-display font-bold">
            The more of you there are, the less each one costs.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-carbon-600">
            Volume breaks apply per line, automatically, from six pieces. There is no account to
            open and nobody to negotiate with — the price in the studio is the price you pay.
          </p>

          <table className="mt-8 w-full text-sm">
            <caption className="sr-only">Volume discount tiers</caption>
            <thead>
              <tr className="border-b border-carbon-200">
                <th scope="col" className="eyebrow pb-2.5 text-left text-carbon-500">
                  Quantity
                </th>
                <th scope="col" className="eyebrow pb-2.5 text-right text-carbon-500">
                  Discount
                </th>
                <th scope="col" className="eyebrow pb-2.5 text-right text-carbon-500">
                  Jersey from
                </th>
              </tr>
            </thead>
            <tbody>
              {QUANTITY_TIERS.map((t) => (
                <tr key={t.min} className="border-b border-carbon-100 last:border-0">
                  <td className="tabular py-3">{t.min}+</td>
                  <td className="tabular py-3 text-right">
                    {t.discount === 0 ? '—' : `−${Math.round(t.discount * 100)}%`}
                  </td>
                  <td className="tabular py-3 text-right font-medium">
                    {formatMoney(Math.round(7200 * (1 - t.discount)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button size="lg" className="mt-8" asChild>
            <Link href="/studio">
              Build a team kit
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grain relative min-h-[380px] overflow-hidden bg-carbon-100">
          <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />
          {/* A squad, not a single shirt — the point of the section. */}
          <div className="absolute inset-0 grid grid-cols-3 content-center gap-1 p-8">
            {[
              { n: '4', name: 'OKONJO' },
              { n: '7', name: 'HARPER' },
              { n: '9', name: 'VASQUEZ' },
              { n: '10', name: 'ILIEV' },
              { n: '14', name: 'SOARES' },
              { n: '21', name: 'BRENNAN' },
            ].map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Garment
                  type="jersey"
                  view="back"
                  bodyHex="#0e4234"
                  accentHex="#0b3326"
                  trimHex="#e8e5dc"
                  shadow={false}
                  customization={{
                    method: 'sublimation',
                    bodyHex: '#0e4234',
                    accentHex: '#0b3326',
                    trimHex: '#e8e5dc',
                    teamName: '',
                    teamFont: 'block',
                    roster: [{ id: p.n, playerName: p.name, number: p.n, size: 'L', quantity: 1 }],
                    numberStyle: 'solid',
                    numberHex: '#e8e5dc',
                    artwork: [],
                    notes: '',
                  }}
                  title={`${p.name}, number ${p.n}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --- order tracking ------------------------------------------------------- */

export function TrackStrip() {
  return (
    <section className="gutter pb-4">
      <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-field-700 p-8 text-chalk sm:flex-row sm:items-center lg:p-10">
        <div className="flex items-start gap-5">
          <PackageSearch className="mt-0.5 h-7 w-7 shrink-0 text-field-300" />
          <div>
            <h2 className="font-display text-xl font-bold">Already ordered?</h2>
            <p className="mt-1.5 max-w-md text-sm text-field-300">
              Follow it through artwork, press, cut-and-sew and QC. You get the actual production
              stage, not a parcel number and a shrug.
            </p>
          </div>
        </div>
        <Button variant="inverse" size="lg" asChild className="shrink-0">
          <Link href="/orders/track">
            Track an order
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}
