import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/misc'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { CartDrawer } from '@/components/site/CartDrawer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
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
