'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Star, Wand2 } from 'lucide-react'
import type { ProductDTO } from '@/lib/catalog'
import { cn, formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import { Badge } from '@/components/ui/badge'

const BADGE_VARIANT = {
  new: 'brand',
  bestseller: 'default',
  pro: 'signal',
} as const

/**
 * The card does two jobs at once: sell the garment, and prove the colourway
 * is real. Hovering a swatch repaints the actual artwork rather than swapping
 * a photo, so what you see is what the studio will print.
 */
export function ProductCard({ product, index = 0 }: { product: ProductDTO; index?: number }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const variant = product.variants[activeIdx] ?? product.variants[0]
  const soldOut = product.variants.every((v) => !v.inStock)

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-carbon-100 transition-colors duration-500 group-hover:bg-carbon-200/80">
          {/* Light grid keeps the cut-out garment from floating in a void —
              the trick Nike uses to make product "pop" off the tile. */}
          <div className="grid-paper absolute inset-0 opacity-50" aria-hidden />

          <motion.div
            className="absolute inset-0 p-6"
            whileHover={{ scale: 1.045, y: -6 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Garment
              key={variant?.id}
              type={product.category}
              bodyHex={variant?.bodyHex ?? '#1b1f21'}
              accentHex={variant?.accentHex ?? '#1b1f21'}
              trimHex={variant?.trimHex ?? '#2b2f32'}
              title={`${product.name} in ${variant?.colorName}`}
            />
          </motion.div>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badge ? (
              <Badge variant={BADGE_VARIANT[product.badge as keyof typeof BADGE_VARIANT]}>
                {product.badge}
              </Badge>
            ) : null}
            {soldOut ? <Badge variant="muted">Sold out</Badge> : null}
          </div>

          {product.customizable ? (
            <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-carbon-900/90 px-2.5 py-1.5 text-[11px] font-medium text-chalk backdrop-blur-sm">
                <Wand2 className="h-3 w-3" />
                Customisable
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/product/${product.slug}`} className="min-w-0">
            <h3 className="truncate text-[15px] font-medium leading-snug transition-colors group-hover:text-field-700">
              {product.name}
            </h3>
          </Link>
          <span className="tabular shrink-0 text-[15px] font-medium">
            {formatMoney(product.basePrice)}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-carbon-500">{product.blurb}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Swatches. Hit area is 24px even though the dot is 14px. */}
          <div className="flex items-center gap-0.5">
            {product.variants.slice(0, 6).map((v, i) => (
              <button
                key={v.id}
                onMouseEnter={() => setActiveIdx(i)}
                onFocus={() => setActiveIdx(i)}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveIdx(i)
                }}
                className="grid h-6 w-6 place-items-center rounded-full"
                aria-label={`Show ${v.colorName}`}
                title={v.colorName}
              >
                <span
                  className={cn(
                    'block h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/15 transition-transform duration-200',
                    i === activeIdx && 'scale-110 ring-2 ring-carbon-900 ring-offset-1 ring-offset-chalk',
                  )}
                  style={{ backgroundColor: v.bodyHex }}
                />
              </button>
            ))}
            {product.variants.length > 6 ? (
              <span className="tabular ml-1 text-[11px] text-carbon-400">
                +{product.variants.length - 6}
              </span>
            ) : null}
          </div>

          {product.reviews > 0 ? (
            <span className="tabular flex shrink-0 items-center gap-1 text-[11px] text-carbon-500">
              <Star className="h-3 w-3 fill-carbon-900 text-carbon-900" />
              {product.rating.toFixed(1)}
              <span className="text-carbon-400">({product.reviews})</span>
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
