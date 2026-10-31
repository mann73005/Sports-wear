'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowLeft, Check, Info, RotateCw, ShoppingBag, Sparkles } from 'lucide-react'
import type { ProductDTO } from '@/lib/catalog'
import {
  PLACEMENT_VIEW,
} from '@/art/garment-paths'
import type { View } from '@/art/garment-paths'
import {
  emptyCustomization,
  isCustomized,
  PRINT_METHODS,
  type Customization,
  type PrintMethodId,
  type RosterEntry,
} from '@/lib/customization'
import { nextTier, priceLine } from '@/lib/pricing'
import { useCart } from '@/lib/cart-store'
import { cn, formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Field } from '@/components/ui/input'
import { Separator, Tabs, TabsContent, TabsList, TabsTrigger, Tooltip } from '@/components/ui/misc'
import { ColorPicker } from './ColorPicker'
import { RosterEditor } from './RosterEditor'
import { ArtworkEditor } from './ArtworkEditor'

/**
 * Recommend a print method from the fabric and the artwork.
 *
 * Sublimation only bonds to polyester; cotton has to be screened or filmed;
 * a cap is too small and too structured for anything but a needle. Getting
 * this wrong is the single most expensive mistake on the floor, so the studio
 * makes the call and explains it rather than leaving it to the customer.
 */
function recommendMethod(product: ProductDTO): { id: PrintMethodId; why: string } {
  if (product.category === 'cap')
    return { id: 'embroidery', why: 'A structured cap panel takes a needle, not ink.' }
  if (/cotton/i.test(product.fabric))
    return {
      id: 'screen',
      why: 'Cotton will not take sublimation dye — screen print is the durable route.',
    }
  if (product.weightGsm <= 150)
    return {
      id: 'sublimation',
      why: 'On a light performance knit, sublimation adds no weight and no hand-feel.',
    }
  return { id: 'dtf', why: 'Full colour, no setup fee, and fine on a technical knit.' }
}

export function Studio({
  product,
  initialVariant = 0,
}: {
  product: ProductDTO
  initialVariant?: number
}) {
  const base = product.variants[initialVariant] ?? product.variants[0]
  const recommendation = useMemo(() => recommendMethod(product), [product])

  const [spec, setSpec] = useState<Customization>(() => ({
    ...emptyCustomization(base.bodyHex, base.accentHex, base.trimHex),
    method: recommendation.id,
  }))
  const [view, setView] = useState<View>('front')
  const [rosterIdx, setRosterIdx] = useState(0)
  const [plainSize, setPlainSize] = useState(base.sizes[2] ?? base.sizes[0])
  const [plainQty, setPlainQty] = useState(1)
  const [tab, setTab] = useState('colour')

  const add = useCart((s) => s.add)
  const pristine = useMemo(
    () => emptyCustomization(base.bodyHex, base.accentHex, base.trimHex),
    [base],
  )

  const hasRoster = spec.roster.length > 0
  const units = hasRoster ? spec.roster.reduce((n, r) => n + r.quantity, 0) : plainQty
  const price = useMemo(() => priceLine(product.basePrice, spec, units), [product, spec, units])
  const upcoming = nextTier(units)

  const patch = (p: Partial<Customization>) => setSpec((s) => ({ ...s, ...p }))

  // Follow the work: adding a number is pointless if you are looking at the
  // chest, so the preview turns to wherever the last edit landed.
  useEffect(() => {
    if (tab === 'roster' && hasRoster) setView('back')
    if (tab === 'text') setView('front')
  }, [tab, hasRoster])

  function handleAdd() {
    const customised = isCustomized(spec, pristine)
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      category: product.category,
      basePrice: product.basePrice,
      size: hasRoster ? 'mixed' : plainSize,
      colorName: customised ? 'Custom' : base.colorName,
      bodyHex: spec.bodyHex,
      accentHex: spec.accentHex,
      trimHex: spec.trimHex,
      quantity: hasRoster ? units : plainQty,
      customization: customised ? spec : null,
    })
    toast.success('Added to cart', {
      description: `${product.name} · ${units} garment${units === 1 ? '' : 's'} · ${formatMoney(price.lineTotal)}`,
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-10">
      {/* ===== preview =====================================================
          Capped width so the preview and the running total stay on screen
          together — the whole point of a live price is seeing it while you
          decide, not after scrolling past a metre of jersey. */}
      <div className="mx-auto w-full max-w-[560px] lg:sticky lg:top-24 lg:self-start">
        <PreviewPanel
          product={product}
          spec={spec}
          view={view}
          setView={setView}
          rosterIdx={rosterIdx}
          setRosterIdx={setRosterIdx}
        />

        {/* Live price. Pinned under the preview on desktop so the cost of the
            decision you are making is never off-screen. */}
        <PricePanel price={price} units={units} upcoming={upcoming} />
      </div>

      {/* ===== controls ==================================================== */}
      <div className="min-w-0">
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-carbon-500 transition-colors hover:text-carbon-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {product.name}
        </Link>

        <h1 className="text-display-sm mt-3 font-display font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-carbon-500">
          {product.fabric} · {product.weightGsm} gsm
        </p>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="no-scrollbar overflow-x-auto">
            {[
              ['colour', 'Colour'],
              ['method', 'Print'],
              ['text', 'Wordmark'],
              ['artwork', 'Artwork'],
              ['roster', 'Roster'],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="shrink-0">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* --- colourway ------------------------------------------------ */}
          <TabsContent value="colour" className="space-y-7">
            <ColorPicker
              label="Body"
              value={spec.bodyHex}
              onChange={(hex) => patch({ bodyHex: hex })}
            />
            <ColorPicker
              label="Panels & sleeves"
              value={spec.accentHex}
              onChange={(hex) => patch({ accentHex: hex })}
            />
            <ColorPicker
              label="Trim"
              value={spec.trimHex}
              onChange={(hex) => patch({ trimHex: hex })}
              hint="Collar, cuffs and hem bands."
            />

            <div>
              <span className="eyebrow mb-2.5 block text-carbon-500">Stock colourways</span>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      patch({ bodyHex: v.bodyHex, accentHex: v.accentHex, trimHex: v.trimHex })
                    }
                    className="flex items-center gap-2 rounded-sm border border-carbon-200 bg-white py-1.5 pl-1.5 pr-2.5 text-[13px] transition-colors hover:border-carbon-400"
                  >
                    <span className="flex">
                      {[v.bodyHex, v.accentHex, v.trimHex].map((h, i) => (
                        <span
                          key={i}
                          className="h-4 w-4 rounded-xs ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: h, marginLeft: i ? -4 : 0 }}
                        />
                      ))}
                    </span>
                    {v.colorName}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* --- method --------------------------------------------------- */}
          <TabsContent value="method" className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-sm border border-field-700/20 bg-field-700/5 p-3.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-field-700" />
              <p className="text-[13px] leading-relaxed text-carbon-700">
                We recommend{' '}
                <strong className="font-medium">{PRINT_METHODS[recommendation.id].label}</strong>{' '}
                for this garment. {recommendation.why}
              </p>
            </div>

            {Object.values(PRINT_METHODS).map((m) => {
              const selected = spec.method === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => patch({ method: m.id as PrintMethodId })}
                  aria-pressed={selected}
                  className={cn(
                    'w-full rounded-lg border p-4 text-left transition-all duration-200',
                    selected
                      ? 'border-carbon-900 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                      : 'border-carbon-200 bg-white/60 hover:border-carbon-400',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {m.label}
                      {m.id === recommendation.id ? (
                        <Badge variant="brand">Recommended</Badge>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                        selected ? 'border-carbon-900 bg-carbon-900' : 'border-carbon-300',
                      )}
                    >
                      {selected ? <Check className="h-2.5 w-2.5 text-chalk" /> : null}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-carbon-500">{m.note}</p>
                  <p className="tabular mt-3 text-xs text-carbon-600">
                    {formatMoney(m.perPlacement)} per placement
                    {m.setupFee > 0 ? ` · ${formatMoney(m.setupFee)} setup` : ' · no setup'}
                  </p>
                </button>
              )
            })}
          </TabsContent>

          {/* --- wordmark ------------------------------------------------- */}
          <TabsContent value="text" className="space-y-6">
            <Field
              label="Chest wordmark"
              htmlFor="teamName"
              hint={`${spec.teamName.length}/16 characters. Printed across the front.`}
            >
              <Input
                id="teamName"
                value={spec.teamName}
                onChange={(e) => patch({ teamName: e.target.value.slice(0, 16) })}
                placeholder="NORTHGATE"
                maxLength={16}
                className="font-mono uppercase tracking-wide"
              />
            </Field>

            <div>
              <span className="eyebrow mb-2.5 block text-carbon-500">Lettering</span>
              <div className="grid grid-cols-3 gap-2">
                {(['block', 'condensed', 'script'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => patch({ teamFont: f })}
                    aria-pressed={spec.teamFont === f}
                    className={cn(
                      'rounded-sm border py-3 text-center transition-all duration-150',
                      spec.teamFont === f
                        ? 'border-carbon-900 bg-carbon-900 text-chalk'
                        : 'border-carbon-200 bg-white hover:border-carbon-400',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-base',
                        f === 'block' && 'font-display font-bold',
                        f === 'condensed' && 'font-display font-bold scale-x-75',
                        f === 'script' && 'font-serif italic',
                      )}
                    >
                      Aa
                    </span>
                    <span className="mt-1 block text-[11px] capitalize opacity-70">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            <ColorPicker
              label="Print colour"
              value={spec.numberHex}
              onChange={(hex) => patch({ numberHex: hex })}
              hint="Used for the wordmark, the names and the numbers."
            />

            <div>
              <span className="eyebrow mb-2.5 block text-carbon-500">Number finish</span>
              <div className="grid grid-cols-3 gap-2">
                {(['solid', 'outline', 'shadow'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => patch({ numberStyle: s })}
                    aria-pressed={spec.numberStyle === s}
                    className={cn(
                      'rounded-sm border py-2.5 text-[13px] capitalize transition-all duration-150',
                      spec.numberStyle === s
                        ? 'border-carbon-900 bg-carbon-900 text-chalk'
                        : 'border-carbon-200 bg-white hover:border-carbon-400',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* --- artwork -------------------------------------------------- */}
          <TabsContent value="artwork">
            <ArtworkEditor
              artwork={spec.artwork}
              allowedZones={product.printZones}
              onChange={(artwork) => {
                patch({ artwork })
                // Jump the preview to whichever side the newest mark is on.
                const last = artwork[artwork.length - 1]
                if (last) setView(PLACEMENT_VIEW[last.placement] ?? 'front')
              }}
            />
          </TabsContent>

          {/* --- roster --------------------------------------------------- */}
          <TabsContent value="roster">
            <RosterEditor
              roster={spec.roster}
              sizes={base.sizes}
              selectedIndex={rosterIdx}
              onSelect={setRosterIdx}
              onChange={(roster: RosterEntry[]) => patch({ roster })}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-7" />

        {/* --- plain size + quantity, only when there is no roster -------- */}
        {!hasRoster ? (
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <span className="eyebrow mb-2.5 block text-carbon-500">Size</span>
              <div className="flex flex-wrap gap-1.5">
                {base.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlainSize(s)}
                    aria-pressed={plainSize === s}
                    className={cn(
                      'tabular h-10 min-w-[48px] rounded-sm border px-2.5 text-[13px] font-medium transition-all duration-150',
                      plainSize === s
                        ? 'border-carbon-900 bg-carbon-900 text-chalk'
                        : 'border-carbon-200 bg-white hover:border-carbon-400',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="eyebrow mb-2.5 block text-carbon-500">Qty</span>
              <Input
                type="number"
                min={1}
                max={999}
                value={plainQty}
                onChange={(e) => setPlainQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                className="tabular h-10 w-24 text-center"
                aria-label="Quantity"
              />
            </div>
          </div>
        ) : (
          <p className="flex items-start gap-2 rounded-sm bg-carbon-100 p-3 text-xs text-carbon-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Sizes and quantities come from the roster — {units} garment
            {units === 1 ? '' : 's'} across {spec.roster.length} row
            {spec.roster.length === 1 ? '' : 's'}.
          </p>
        )}

        <Field label="Note for the floor" htmlFor="notes" className="mt-6">
          <Input
            id="notes"
            value={spec.notes}
            onChange={(e) => patch({ notes: e.target.value.slice(0, 400) })}
            placeholder="Anything the operator should know"
          />
        </Field>

        <Button size="lg" className="mt-6 w-full" onClick={handleAdd}>
          <ShoppingBag />
          Add to cart · {formatMoney(price.lineTotal)}
        </Button>
      </div>
    </div>
  )
}

/* --- preview -------------------------------------------------------------- */

function PreviewPanel({
  product,
  spec,
  view,
  setView,
  rosterIdx,
  setRosterIdx,
}: {
  product: ProductDTO
  spec: Customization
  view: View
  setView: (v: View) => void
  rosterIdx: number
  setRosterIdx: (i: number) => void
}) {
  const entry = spec.roster[rosterIdx]

  return (
    <div>
      <div className="grain relative aspect-square overflow-hidden rounded-xl bg-carbon-100">
        <div className="grid-paper absolute inset-0 opacity-50" aria-hidden />

        <motion.div
          key={view}
          initial={{ opacity: 0, rotateY: view === 'back' ? -14 : 14 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 p-10 lg:p-14"
          style={{ perspective: 1200 }}
        >
          <Garment
            type={product.category}
            view={view}
            bodyHex={spec.bodyHex}
            accentHex={spec.accentHex}
            trimHex={spec.trimHex}
            customization={spec}
            rosterIndex={rosterIdx}
            title={`Live preview, ${view} view`}
          />
        </motion.div>

        <Badge variant="outline" className="absolute left-4 top-4 border-carbon-300 bg-chalk/85 backdrop-blur-sm">
          Live preview
        </Badge>

        <button
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-sm border border-carbon-200 bg-chalk/90 px-3 py-2 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-chalk"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {view === 'front' ? 'Back' : 'Front'}
        </button>
      </div>

      {/* Per-shirt preview — check every player before it is made. */}
      <AnimatePresence>
        {spec.roster.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2">
              <span className="eyebrow shrink-0 text-carbon-500">Previewing</span>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {spec.roster.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRosterIdx(i)
                      setView('back')
                    }}
                    aria-pressed={i === rosterIdx}
                    className={cn(
                      'tabular shrink-0 rounded-xs border px-2 py-1 text-[11px] transition-colors',
                      i === rosterIdx
                        ? 'border-carbon-900 bg-carbon-900 text-chalk'
                        : 'border-carbon-200 bg-white hover:border-carbon-400',
                    )}
                  >
                    {r.number || '—'} {r.playerName || 'unnamed'}
                  </button>
                ))}
              </div>
            </div>
            {entry ? (
              <p className="tabular mt-2 text-xs text-carbon-500">
                Size {entry.size} · {entry.quantity} piece{entry.quantity === 1 ? '' : 's'}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* --- price ---------------------------------------------------------------- */

function PricePanel({
  price,
  units,
  upcoming,
}: {
  price: ReturnType<typeof priceLine>
  units: number
  upcoming: ReturnType<typeof nextTier>
}) {
  return (
    <div className="mt-4 rounded-lg border border-carbon-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-carbon-500">Running total</span>
        <Tooltip label="Recalculated on every change. This is the price you pay — there is no quote step.">
          <Info className="h-3.5 w-3.5 text-carbon-400" />
        </Tooltip>
      </div>

      <dl className="mt-3 space-y-1.5">
        {price.lines.map((l, i) => (
          <motion.div
            key={`${l.label}-${i}`}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-baseline justify-between gap-3 text-[13px]"
          >
            <dt className="text-carbon-600">
              {l.label}
              {l.detail ? <span className="tabular ml-1.5 text-carbon-400">{l.detail}</span> : null}
            </dt>
            <dd className={cn('tabular shrink-0', l.amount < 0 ? 'text-ok' : 'text-carbon-800')}>
              {l.amount < 0 ? '−' : ''}
              {formatMoney(Math.abs(l.amount))}
            </dd>
          </motion.div>
        ))}
      </dl>

      <Separator className="my-3.5" />

      <div className="flex items-baseline justify-between">
        <span className="text-sm">
          Total
          <span className="tabular ml-2 text-xs text-carbon-500">
            {units} piece{units === 1 ? '' : 's'}
          </span>
        </span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={price.lineTotal}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="tabular font-display text-2xl font-bold"
          >
            {formatMoney(price.lineTotal)}
          </motion.span>
        </AnimatePresence>
      </div>

      <p className="tabular mt-1 text-right text-xs text-carbon-500">
        {formatMoney(Math.round(price.lineTotal / units))} each
      </p>

      {upcoming ? (
        <p className="mt-3 rounded-sm bg-carbon-100 px-3 py-2 text-xs text-carbon-600">
          <span className="tabular font-medium text-carbon-900">{upcoming.min - units}</span> more
          and the whole line drops{' '}
          <span className="font-medium text-field-700">
            {Math.round(upcoming.discount * 100)}%
          </span>
          .
        </p>
      ) : null}
    </div>
  )
}
