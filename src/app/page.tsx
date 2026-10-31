import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getFeatured } from '@/lib/catalog'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { Process } from '@/components/home/Process'
import { Categories, Methods, TeamPricing, TrackStrip } from '@/components/home/Sections'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const featured = await getFeatured(4)

  return (
    <>
      <Hero />
      <Marquee />

      <section className="gutter py-20 lg:py-28">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-carbon-500">Picked for this week</p>
            <h2 className="text-display-md mt-3 font-display font-bold">What clubs are ordering.</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/shop">
              See all 17
              <ArrowRight />
            </Link>
          </Button>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <Process />
      <Methods />
      <Categories />
      <TeamPricing />
      <TrackStrip />
    </>
  )
}
