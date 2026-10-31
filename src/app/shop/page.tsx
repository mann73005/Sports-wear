import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchX } from 'lucide-react'
import { getFacets, getProducts, type ShopFilters as Filters } from '@/lib/catalog'
import { CATEGORY_LABELS, SPORT_LABELS } from '@/lib/catalog.shared'
import { ProductCard } from '@/components/product/ProductCard'
import { ShopFilters } from '@/components/product/ShopFilters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/misc'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Every blank ATHLON prints on — jerseys, fleece, tights, shells and caps. Filter by discipline, cut and fit.',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  const filters: Filters = {
    category: one(sp.category),
    sport: one(sp.sport),
    gender: one(sp.gender),
    fit: one(sp.fit),
    maxPrice: sp.maxPrice ? Number(one(sp.maxPrice)) : undefined,
    search: one(sp.q),
    sort: (one(sp.sort) as Filters['sort']) ?? 'featured',
  }

  const [products, facets] = await Promise.all([getProducts(filters), getFacets()])

  // The heading reflects whatever has been narrowed down, so a filtered page
  // still reads like a page rather than a generic grid.
  const heading = filters.category
    ? CATEGORY_LABELS[filters.category]
    : filters.sport
      ? `${SPORT_LABELS[filters.sport]} kit`
      : 'Everything we print on'

  return (
    <div className="gutter py-10 lg:py-14">
      <header className="max-w-2xl">
        <nav aria-label="Breadcrumb" className="eyebrow text-carbon-500">
          <Link href="/" className="transition-colors hover:text-carbon-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-carbon-900">Shop</span>
        </nav>
        <h1 className="text-display-lg mt-4 font-display font-bold">{heading}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-carbon-600">
          Every piece here is a blank we can print, stitch or sublimate to order — and every one
          lists the fabric, the weight and the cut, because that is what decides whether it is
          right for you.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ShopFilters facets={facets} resultCount={products.length} />
          </Suspense>
        </aside>

        <div>
          {products.length === 0 ? (
            <EmptyResults />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyResults() {
  return (
    <div className="grid-paper flex flex-col items-center justify-center gap-5 rounded-lg border border-carbon-200 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-carbon-200 bg-white">
        <SearchX className="h-5 w-5 text-carbon-400" />
      </div>
      <div>
        <p className="font-display text-lg">Nothing matches that combination</p>
        <p className="mt-1.5 max-w-sm text-sm text-carbon-500">
          Try widening the discipline or the price ceiling — we only carry seventeen blanks, so
          narrow filters run out fast.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/shop">Clear filters</Link>
      </Button>
    </div>
  )
}
