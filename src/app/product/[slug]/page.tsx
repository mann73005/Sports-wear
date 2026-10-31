import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getProduct, getRelated } from '@/lib/catalog'
import { formatMoney } from '@/lib/utils'
import { ProductDetail } from '@/components/product/ProductDetail'
import { ProductCard } from '@/components/product/ProductCard'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Not found' }

  return {
    title: product.name,
    description: `${product.blurb} ${product.fabric}, ${product.weightGsm} gsm. From ${formatMoney(product.basePrice)}.`,
    openGraph: { title: product.name, description: product.blurb },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelated(product, 4)

  // Structured data: a product page without it is invisible to the shopping
  // surfaces that drive a meaningful slice of apparel traffic.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    material: product.fabric,
    offers: {
      '@type': 'Offer',
      price: (product.basePrice / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: product.variants.some((v) => v.inStock)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }
      : {}),
  }

  return (
    <div className="gutter py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetail product={product} />

      {related.length > 0 ? (
        <section className="mt-24 border-t border-carbon-200 pt-14">
          <h2 className="text-display-sm font-display font-bold">Goes with it</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
