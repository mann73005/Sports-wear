import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, FileImage, Layers, Users } from 'lucide-react'
import { getProducts } from '@/lib/catalog'
import { PRINT_METHODS, PLACEMENTS } from '@/lib/customization'
import { QUANTITY_TIERS } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'The studio',
  description:
    'Design your own kit: repaint the garment, place a crest, name the squad and watch the price update live. No minimum order, no quote step.',
}

const PILLARS = [
  {
    icon: Layers,
    title: 'Repaint the garment',
    body: 'Body, panels and trim are separate paint slots on real vector artwork, so what you approve is what the dye house gets — down to the hex value.',
  },
  {
    icon: FileImage,
    title: 'Place your mark',
    body: 'Drop in a crest, scale it, position it, and see it clipped to actual fabric. Up to five placements per garment depending on what the piece supports.',
  },
  {
    icon: Users,
    title: 'Name the squad',
    body: 'One row per player with their own name, number and size. Every shirt gets previewed individually before the order leaves — which is how misprints stop happening.',
  },
]

export default async function StudioPage() {
  const products = await getProducts({ sort: 'featured' })
  const customizable = products.filter((p) => p.customizable)

  return (
    <div>
      {/* --- hero --------------------------------------------------------- */}
      <section className="gutter py-14 lg:py-20">
        <div className="max-w-3xl">
          <Badge variant="brand">The studio</Badge>
          <h1 className="text-display-lg mt-5 font-display font-bold">
            Design it, see it,
            <br />
            <span className="text-carbon-300">then buy it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-carbon-600">
            Most custom kit is bought blind: you send artwork, wait for a quote, approve a flat
            mockup and hope. Here the preview is the product — it is drawn from the same spec the
            press reads, the price recalculates on every change, and the minimum order is one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/customize/meridian-match-jersey">
                Start with a match jersey
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#blanks">Pick a different blank</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl bg-carbon-200 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white p-7">
              <Icon className="h-5 w-5 text-field-700" />
              <h2 className="mt-4 font-display text-base font-bold">{title}</h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-carbon-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- methods ------------------------------------------------------ */}
      <section id="methods" className="gutter border-t border-carbon-200 py-16 lg:py-20">
        <h2 className="text-display-md font-display font-bold">Print methods</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-carbon-600">
          The studio recommends one based on the fabric and the artwork, and tells you why. You
          can always override it — these are the trade-offs you are choosing between.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">Print method comparison</caption>
            <thead>
              <tr className="border-b border-carbon-300">
                {['Method', 'Best for', 'Per placement', 'Setup', 'Colours'].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`eyebrow pb-3 text-carbon-500 ${i > 1 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(PRINT_METHODS).map((m) => (
                <tr key={m.id} className="border-b border-carbon-100 last:border-0">
                  <th scope="row" className="py-4 text-left align-top">
                    <span className="block font-medium">{m.label}</span>
                    <span className="mt-1 block max-w-xs text-xs font-normal leading-relaxed text-carbon-500">
                      {m.note}
                    </span>
                  </th>
                  <td className="py-4 align-top text-carbon-600">{m.bestFor}</td>
                  <td className="tabular py-4 text-right align-top">
                    {formatMoney(m.perPlacement)}
                  </td>
                  <td className="tabular py-4 text-right align-top">
                    {m.setupFee === 0 ? (
                      <span className="text-ok">None</span>
                    ) : (
                      formatMoney(m.setupFee)
                    )}
                  </td>
                  <td className="tabular py-4 text-right align-top">
                    {m.maxColors === Infinity ? 'Unlimited' : m.maxColors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- artwork + volume --------------------------------------------- */}
      <section className="gutter grid gap-10 border-t border-carbon-200 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div id="artwork">
          <h2 className="text-display-sm font-display font-bold">Artwork that prints well</h2>
          <p className="mt-4 text-sm leading-relaxed text-carbon-600">
            The studio will take almost anything, but these four things are the difference
            between a crest that looks sharp on the pitch and one that looks like a photocopy.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Vector SVG wherever possible — it is resolution-independent, so it is as sharp on a sleeve as on a full back.',
              'PNG with a genuinely transparent background. A white box around a crest will print as a white box.',
              'Keep fine detail above about 1 mm. Thinner strokes close up in screen print and sublimation alike.',
              'Flat shapes beat gradients on cotton. If the artwork has a gradient, DTF or sublimation will hold it; screen print will not.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-field-700" />
                <span className="text-[13px] leading-relaxed text-carbon-700">{t}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-8 mb-3 text-carbon-500">Placements</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(PLACEMENTS).map((p) => (
              <Badge key={p.id} variant="outline">
                {p.label} · max {p.maxArea}
              </Badge>
            ))}
          </div>
        </div>

        <div id="volume">
          <h2 className="text-display-sm font-display font-bold">Team pricing</h2>
          <p className="mt-4 text-sm leading-relaxed text-carbon-600">
            Applied per line, automatically, the moment the quantity crosses a break. There is no
            account to open and nothing to negotiate — the number in the studio is the number you
            pay.
          </p>

          <table className="mt-6 w-full text-sm">
            <caption className="sr-only">Volume discount tiers</caption>
            <thead>
              <tr className="border-b border-carbon-300">
                <th scope="col" className="eyebrow pb-3 text-left text-carbon-500">
                  Garments
                </th>
                <th scope="col" className="eyebrow pb-3 text-right text-carbon-500">
                  Off the line
                </th>
                <th scope="col" className="eyebrow pb-3 text-right text-carbon-500">
                  Match jersey each
                </th>
              </tr>
            </thead>
            <tbody>
              {QUANTITY_TIERS.map((t) => (
                <tr key={t.min} className="border-b border-carbon-100 last:border-0">
                  <td className="tabular py-3.5">{t.min}+</td>
                  <td className="tabular py-3.5 text-right">
                    {t.discount === 0 ? (
                      <span className="text-carbon-400">—</span>
                    ) : (
                      <span className="text-ok">−{Math.round(t.discount * 100)}%</span>
                    )}
                  </td>
                  <td className="tabular py-3.5 text-right font-medium">
                    {formatMoney(Math.round(7200 * (1 - t.discount)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-xs leading-relaxed text-carbon-500">
            Shown on the Meridian Match Jersey before print work. Screen print and embroidery add
            a one-off setup per placement; sublimation and DTF do not.
          </p>
        </div>
      </section>

      {/* --- the blanks --------------------------------------------------- */}
      <section id="blanks" className="gutter border-t border-carbon-200 py-16 lg:py-20">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-display-md font-display font-bold">Pick a blank</h2>
            <p className="mt-3 text-sm text-carbon-600">
              {customizable.length} of our {products.length} pieces go through the studio.
            </p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
          {customizable.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
