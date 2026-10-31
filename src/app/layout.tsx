import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/misc'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { CartDrawer } from '@/components/site/CartDrawer'
import './globals.css'

/* ===========================================================================
   Fonts are self-hosted rather than pulled through `next/font/google`.

   That loader fetches the font CSS from Google at build time, which makes the
   build depend on a third-party network call — it fails hard when that call
   is blocked, rate-limited or returns a format the parser does not expect.
   These are the same three families, latin subset, as variable woff2 files
   (112 KB total), so there is also one fewer origin to connect to at runtime.

   To update one: fetch its css2 URL with a modern browser user-agent, take
   the woff2 whose unicode-range covers U+0000-00FF, and replace the file.
   =========================================================================== */

const inter = localFont({
  src: './fonts/inter.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

const spaceGrotesk = localFont({
  src: './fonts/space-grotesk.woff2',
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: '300 700',
  fallback: ['Arial Black', 'system-ui', 'sans-serif'],
})

const jetbrains = localFont({
  src: './fonts/jetbrains-mono.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
  weight: '100 800',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://athlon.example'),
  title: {
    default: 'ATHLON — Performance sportswear, printed to order',
    template: '%s · ATHLON',
  },
  description:
    'Competition-grade sportswear made and printed to order. Design your kit in the studio, see it before you buy it, and track it from the press to the door.',
  openGraph: {
    title: 'ATHLON — Performance sportswear, printed to order',
    description: 'Design your kit in the studio. Made to order, tracked from the press to the door.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8f7f3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <TooltipProvider>
          {/* Keyboard users land here first; the header nav is long. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-carbon-900 focus:px-4 focus:py-2 focus:text-sm focus:text-chalk"
          >
            Skip to content
          </a>

          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '5px',
                border: '1px solid var(--color-carbon-200)',
                fontFamily: 'var(--font-inter)',
                fontSize: '13px',
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  )
}
