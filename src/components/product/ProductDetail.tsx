'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import {
  Check,
  Ruler,
  RotateCw,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
  Wand2,
} from 'lucide-react'
import type { ProductDTO } from '@/lib/catalog'
import { CATEGORY_LABELS, FIT_LABELS, SPORT_LABELS } from '@/lib/catalog.shared'
import { FIT_ADVICE, guideFor } from '@/lib/sizing'
import { useCart } from '@/lib/cart-store'
import { cn, contrastOn, formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import type { View } from '@/art/garment-paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Separator,
  Tooltip,
} from '@/components/ui/misc'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function ProductDetail({ product }: { product: ProductDTO }) {
  const [variantIdx, setVariantIdx] = useState(() =>
    Math.max(0, product.variants.findIndex((v) => v.inStock)),
  )
  const [view, setView] = useState<View>('front')
  const [size, setSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)

  const add = useCart((s) => s.add)
  const variant = product.variants[variantIdx] ?? product.variants[0]
  const guide = useMemo(() => guideFor(product.category), [product.category])

  const sizes = variant?.sizes ?? []
  const stockForSize = size ? (variant?.stock[size] ?? 0) : 0
  const lowStock = size !== null && stockForSize > 0 && stockForSize <= 6

  function handleAdd() {
    if (!size) {
      setSizeError(true)
      // Move focus to the size group rather than just colouring it red.
      document.getElementById('size-group')?.scrollIntoView({ block: 'center' })
      return
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      category: product.category,
      basePrice: product.basePrice,
      size,
      colorName: variant.colorName,
      bodyHex: variant.bodyHex,
      accentHex: variant.accentHex,
      trimHex: variant.trimHex,
      quantity: 1,
      customization: null,
    })
    toast.success('Added to cart', { description: `${product.name} · ${variant.colorName} · ${size}` })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      {/* ===== gallery ===================================================== */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="grain relative aspect-square overflow-hidden rounded-xl bg-carbon-100">
          <div className="grid-paper absolute inset-0 opacity-50" aria-hidden />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${variant?.id}-${view}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 p-10 lg:p-16"
            >
              <Garment
                type={product.category}
                view={view}
                bodyHex={variant?.bodyHex ?? '#1b1f21'}
                accentHex={variant?.accentHex ?? '#1b1f21'}
                trimHex={variant?.trimHex ?? '#2b2f32'}
                title={`${product.name}, ${variant?.colorName}, ${view} view`}
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute left-4 top-4 flex gap-1.5">
            {product.badge ? <Badge variant="brand">{product.badge}</Badge> : null}
            <Badge variant="outline" className="border-carbon-300 bg-chalk/80 backdrop-blur-sm">
              {product.weightGsm} gsm
            </Badge>
          </div>

          <button
            onClick={() => setView((v) => (v === 'front' ? 'back' : 'front'))}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-sm border border-carbon-200 bg-chalk/90 px-3 py-2 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-chalk"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {view === 'front' ? 'See the back' : 'See the front'}
          </button>
        </div>

        {/* Thumbnails: every colourway, both as a picker and as proof. */}
        <div className="mt-3 grid grid-cols-6 gap-2">
          {product.variants.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setVariantIdx(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-sm bg-carbon-100 p-1.5 transition-all duration-200',
                i === variantIdx
                  ? 'ring-2 ring-carbon-900 ring-offset-2 ring-offset-chalk'
                  : 'opacity-70 hover:opacity-100',
              )}
              aria-label={v.colorName}
              aria-pressed={i === variantIdx}
            >
              <Garment
                type={product.category}
                view={view}
                bodyHex={v.bodyHex}
                accentHex={v.accentHex}
                trimHex={v.trimHex}
                shadow={false}
              />
              {!v.inStock ? (
                <span className="absolute inset-0 grid place-items-center bg-chalk/70 text-[9px] font-medium uppercase">
                  Sold out
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ===== buy panel =================================================== */}
      <div>
        <nav aria-label="Breadcrumb" className="eyebrow text-carbon-500">
          <Link href="/shop" className="transition-colors hover:text-carbon-900">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/shop?category=${product.category}`}
            className="transition-colors hover:text-carbon-900"
          >
            {CATEGORY_LABELS[product.category]}
          </Link>
        </nav>

        <h1 className="text-display-md mt-3 font-display font-bold">{product.name}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="tabular text-xl font-medium">{formatMoney(product.basePrice)}</p>
          {product.reviews > 0 ? (
            <span className="tabular flex items-center gap-1.5 text-sm text-carbon-500">
              <span className="flex" aria-hidden>
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      'h-3.5 w-3.5',
                      n < Math.round(product.rating)
                        ? 'fill-carbon-900 text-carbon-900'
                        : 'text-carbon-300',
                    )}
                  />
                ))}
              </span>
              {product.rating.toFixed(1)}
              <span className="text-carbon-400">({product.reviews} reviews)</span>
            </span>
          ) : null}
          <span className="tabular text-xs text-carbon-400">{product.sku}</span>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-carbon-600">{product.blurb}</p>

        {/* --- reassurance, above the fold. Baymard: 44% of apparel sites
            bury this at checkout, and it is a top source of hesitation. --- */}
        <ul className="mt-6 grid gap-2.5 rounded-lg border border-carbon-200 bg-white p-4 sm:grid-cols-2">
          {[
            { icon: Truck, text: 'Free standard shipping' },
            { icon: Undo2, text: '30-day returns, no questions' },
            { icon: ShieldCheck, text: 'Two-year construction warranty' },
            { icon: Wand2, text: 'Printed to order on our floor' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-[13px] text-carbon-700">
              <Icon className="h-4 w-4 shrink-0 text-field-700" />
              {text}
            </li>
          ))}
        </ul>

        <Separator className="my-7" />

        {/* --- colourway --------------------------------------------------- */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="eyebrow text-carbon-500">Colourway</span>
            <span className="text-sm font-medium">{variant?.colorName}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <Tooltip key={v.id} label={v.inStock ? v.colorName : `${v.colorName} — sold out`}>
                <button
                  onClick={() => {
                    setVariantIdx(i)
                    // A size that exists in one colourway may be gone in the
                    // next; clearing avoids silently adding an OOS size.
                    if (size && !(product.variants[i].stock[size] > 0)) setSize(null)
                  }}
                  disabled={!v.inStock}
                  aria-label={v.colorName}
                  aria-pressed={i === variantIdx}
                  className={cn(
                    'relative grid h-10 w-10 place-items-center rounded-sm transition-all duration-200',
                    i === variantIdx
                      ? 'ring-2 ring-carbon-900 ring-offset-2 ring-offset-chalk'
                      : 'ring-1 ring-carbon-200 hover:ring-carbon-400',
                    !v.inStock && 'opacity-40',
                  )}
                  style={{ backgroundColor: v.bodyHex }}
                >
                  {i === variantIdx ? (
                    <Check className="h-4 w-4" style={{ color: contrastOn(v.bodyHex) }} />
                  ) : null}
                  {!v.inStock ? (
                    <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-carbon-900/60" />
                  ) : null}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* --- size -------------------------------------------------------- */}
        <div id="size-group" className="mt-7">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="eyebrow text-carbon-500">
              Size
              {sizeError && !size ? <span className="ml-2 text-danger">— pick one</span> : null}
            </span>
            <SizeGuideDialog
              guide={guide}
              category={product.category}
              productName={product.name}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const n = variant.stock[s] ?? 0
              const out = n === 0
              return (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s)
                    setSizeError(false)
                  }}
                  disabled={out}
                  aria-pressed={size === s}
                  className={cn(
                    'tabular relative h-11 min-w-[56px] rounded-sm border px-3 text-sm font-medium transition-all duration-150',
                    size === s
                      ? 'border-carbon-900 bg-carbon-900 text-chalk'
                      : 'border-carbon-200 bg-white hover:border-carbon-400',
                    out && 'cursor-not-allowed border-carbon-100 bg-carbon-50 text-carbon-300',
                    sizeError && !size && 'border-danger/40',
                  )}
                >
                  {s}
                  {out ? (
                    <span className="absolute inset-x-2 top-1/2 h-px rotate-[-20deg] bg-carbon-300" />
                  ) : null}
                </button>
              )
            })}
          </div>

          <p className="mt-3 flex items-start gap-2 text-xs text-carbon-500">
            <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {FIT_ADVICE[product.fit]}
          </p>

          <AnimatePresence>
            {lowStock ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="tabular mt-2 text-xs font-medium text-signal-600"
              >
                Only {stockForSize} left in {size} · {variant.colorName}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* --- actions ----------------------------------------------------- */}
        <div className="mt-8 grid gap-2.5">
          <Button size="lg" onClick={handleAdd}>
            Add to cart · {formatMoney(product.basePrice)}
          </Button>

          {product.customizable ? (
            <Button size="lg" variant="outline" asChild>
              <Link href={`/customize/${product.slug}?variant=${variantIdx}`}>
                <Wand2 />
                Customise in the studio
              </Link>
            </Button>
          ) : null}

          <p className="mt-1 text-center text-xs text-carbon-500">
            Stock pieces ship in 1-2 days · Custom pieces take 5-7
          </p>
        </div>

        {/* --- the technical story ---------------------------------------- */}
        <Accordion type="single" collapsible defaultValue="detail" className="mt-9">
          <AccordionItem value="detail">
            <AccordionTrigger>Construction & materials</AccordionTrigger>
            <AccordionContent>
              <p className="mb-5">{product.description}</p>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {[
                  ['Fabric', product.fabric],
                  ['Weight', `${product.weightGsm} gsm`],
                  ['Fit', FIT_LABELS[product.fit]],
                  ['Discipline', SPORT_LABELS[product.sport]],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-carbon-100 pt-2.5">
                    <dt className="eyebrow text-carbon-500">{k}</dt>
                    <dd className="mt-1 text-[13px] text-carbon-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="features">
            <AccordionTrigger>What is built into it</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2.5">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-field-700" />
                    <span className="text-[13px]">{f}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="print">
            <AccordionTrigger>Printing & placements</AccordionTrigger>
            <AccordionContent>
              {product.customizable ? (
                <>
                  <p className="mb-4">
                    This garment takes print in {product.printZones.length} position
                    {product.printZones.length === 1 ? '' : 's'}. The studio previews each one on
                    the actual artwork before you commit.
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {product.printZones.map((z) => (
                      <Badge key={z} variant="outline">
                        {z.replace('-', ' ')}
                      </Badge>
                    ))}
                  </ul>
                </>
              ) : (
                <p>This piece is not customisable.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="care">
            <AccordionTrigger>Care & returns</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">{product.careNotes}</p>
              <p>
                Thirty days to return an unworn stock piece for a full refund. Custom pieces are
                made for you, so they are only returnable if we got the spec wrong — which is
                exactly why the studio shows you the preview first.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

function SizeGuideDialog({
  guide,
  category,
  productName,
}: {
  guide: ReturnType<typeof guideFor>
  category: string
  productName: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-xs text-carbon-600 underline underline-offset-4 transition-colors hover:text-carbon-900">
          <Ruler className="h-3.5 w-3.5" />
          Size guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>Size guide</DialogTitle>
        <p className="mb-5 text-sm text-carbon-500">
          {productName} · measurements for {CATEGORY_LABELS[category]?.toLowerCase() ?? category}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-carbon-200">
                <th scope="col" className="eyebrow pb-2.5 text-left text-carbon-500">
                  Size
                </th>
                {guide.columns.map((c) => (
                  <th key={c} scope="col" className="eyebrow pb-2.5 text-right text-carbon-500">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((r) => (
                <tr key={r.size} className="border-b border-carbon-100 last:border-0">
                  <th scope="row" className="tabular py-2.5 text-left font-medium">
                    {r.size}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="tabular py-2.5 text-right text-carbon-600">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 rounded-sm bg-carbon-100 p-3 text-xs leading-relaxed text-carbon-600">
          {guide.note}
        </p>
      </DialogContent>
    </Dialog>
  )
}
