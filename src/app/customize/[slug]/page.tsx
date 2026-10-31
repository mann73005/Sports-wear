import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/catalog'
import { Studio } from '@/components/studio/Studio'

type Params = Promise<{ slug: string }>
type Search = Promise<{ variant?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  return {
    title: product ? `Customise the ${product.name}` : 'Studio',
    description: product
      ? `Repaint it, print it and name the squad. Live preview and live pricing on the ${product.name}.`
      : undefined,
  }
}

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { slug } = await params
  const { variant } = await searchParams

  const product = await getProduct(slug)
  if (!product) notFound()

  if (!product.customizable) {
    return (
      <div className="gutter py-24 text-center">
        <h1 className="text-display-sm font-display font-bold">
          The {product.name} is not customisable
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-carbon-600">
          Its construction does not take print. Everything else on the shelf does.
        </p>
      </div>
    )
  }

  const idx = Math.max(0, Math.min(product.variants.length - 1, Number(variant) || 0))

  return (
    <div className="gutter py-8 lg:py-12">
      <Studio product={product} initialVariant={idx} />
    </div>
  )
}
