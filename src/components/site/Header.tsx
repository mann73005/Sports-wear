'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Package, ShoppingBag, X } from 'lucide-react'
import { cartCount, useCart } from '@/lib/cart-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'

const NAV = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=jersey', label: 'Team kit' },
  { href: '/studio', label: 'Studio' },
  { href: '/orders/track', label: 'Track order' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const items = useCart((s) => s.items)
  const openCart = useCart((s) => s.open)

  // The store rehydrates from localStorage after mount, so the badge has to
  // stay empty on the first paint or the server and client markup disagree.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const count = mounted ? cartCount(items) : 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  // The admin console is a different product; it gets no storefront chrome.
  if (pathname.startsWith('/admin')) return null

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'border-b border-carbon-200 bg-chalk/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="gutter flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-70" aria-label="ATHLON home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((item) => {
              const active =
                item.href === '/shop'
                  ? pathname === '/shop'
                  : pathname.startsWith(item.href.split('?')[0]) && item.href !== '/shop'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-sm px-3 py-2 text-sm transition-colors',
                    active ? 'text-carbon-900' : 'text-carbon-600 hover:text-carbon-900',
                  )}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-carbon-900"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="iconSm" asChild className="hidden sm:inline-flex">
              <Link href="/orders/track" aria-label="Track an order">
                <Package />
              </Link>
            </Button>

            <button
              onClick={openCart}
              className="relative flex h-9 items-center gap-2 rounded-sm px-3 text-sm text-carbon-700 transition-colors hover:bg-carbon-100 hover:text-carbon-900"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence initial={false}>
                {count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                    className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-carbon-900 px-1.5 text-[11px] font-medium text-chalk"
                  >
                    {count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>

            <Button
              variant="ghost"
              size="iconSm"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-16 z-30 overflow-hidden border-b border-carbon-200 bg-chalk md:hidden"
          >
            <nav className="gutter flex flex-col py-3" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-carbon-100 py-3.5 text-[15px] text-carbon-800 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
