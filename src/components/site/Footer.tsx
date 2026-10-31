'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All kit' },
      { href: '/shop?category=jersey', label: 'Jerseys' },
      { href: '/shop?category=hoodie', label: 'Fleece' },
      { href: '/shop?category=tights', label: 'Tights & shorts' },
      { href: '/shop?sport=running', label: 'Running' },
      { href: '/shop?sport=cycling', label: 'Cycling' },
    ],
  },
  {
    title: 'Custom',
    links: [
      { href: '/studio', label: 'The studio' },
      { href: '/studio#methods', label: 'Print methods' },
      { href: '/studio#volume', label: 'Team pricing' },
      { href: '/studio#artwork', label: 'Artwork guidelines' },
    ],
  },
  {
    title: 'Orders',
    links: [
      { href: '/orders/track', label: 'Track an order' },
      { href: '/cart', label: 'Your cart' },
      { href: '/orders/track', label: 'Returns' },
      { href: '/admin', label: 'Production console' },
    ],
  },
]

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="relative mt-24 overflow-hidden bg-carbon-950 text-carbon-300">
      <div className="grid-paper-dark absolute inset-0 opacity-40" aria-hidden />

      <div className="gutter relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="text-chalk transition-opacity hover:opacity-70">
              <Logo />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-carbon-400">
              Competition-grade sportswear, made and printed to order on one floor. No minimum,
              no dead stock, nothing in a warehouse waiting to be marked down.
            </p>

            <dl className="mt-8 grid max-w-sm grid-cols-3 gap-4 border-t border-carbon-800 pt-6">
              {[
                ['Lead time', '5-7 days'],
                ['Minimum', '1 piece'],
                ['Returns', '30 days'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-carbon-500">{k}</dt>
                  <dd className="tabular mt-1.5 text-sm text-chalk">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="eyebrow mb-4 text-carbon-500">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((l, i) => (
                    <li key={`${l.href}-${i}`}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1 text-sm text-carbon-300 transition-colors hover:text-chalk"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Oversized wordmark, cropped at the baseline. */}
        <div className="mt-20 select-none overflow-hidden" aria-hidden>
          <div className="font-display text-chalk/[0.07] leading-[0.75] tracking-[-0.05em] text-[clamp(4rem,19vw,17rem)]">
            ATHLON
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-carbon-800 pt-6 text-xs text-carbon-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ATHLON. A fictional brand, built as a demonstration.</p>
          <p className="tabular">All artwork drawn in code — no photography, no stock imagery.</p>
        </div>
      </div>
    </footer>
  )
}
