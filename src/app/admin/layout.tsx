import Link from 'next/link'
import { ArrowUpRight, Factory } from 'lucide-react'

/**
 * The console is an internal tool, so it gets its own chrome: dark, dense,
 * and visibly not the storefront. Nothing here is authenticated — a real
 * deployment would put staff auth in front of this layout and the two API
 * routes it calls.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-carbon-950 text-carbon-200">
      <header className="sticky top-0 z-40 border-b border-carbon-800 bg-carbon-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1480px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/admin" className="flex items-center gap-2.5 text-chalk">
            <Factory className="h-4 w-4 text-field-400" />
            <span className="font-display text-sm font-bold tracking-tight">
              ATHLON <span className="text-carbon-500">/ production</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="eyebrow hidden text-carbon-600 sm:inline">
              Demo console · no authentication
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-carbon-400 transition-colors hover:text-chalk"
            >
              Storefront
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1480px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  )
}
