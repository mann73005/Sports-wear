'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Wand2 } from 'lucide-react'
import { Garment } from '@/art/Garment'
import { Button } from '@/components/ui/button'
import type { GarmentType } from '@/art/garment-paths'

/** The reel the hero cycles through — one per discipline we actually stock. */
const REEL: {
  type: GarmentType
  body: string
  accent: string
  trim: string
  team: string
  number: string
  sport: string
  gsm: number
}[] = [
  { type: 'jersey', body: '#0e4234', accent: '#0b3326', trim: '#e8e5dc', team: 'NORTHGATE', number: '10', sport: 'Football', gsm: 145 },
  { type: 'tank', body: '#e8552f', accent: '#e8552f', trim: '#15181a', team: 'EASTSIDE', number: '23', sport: 'Basketball', gsm: 160 },
  { type: 'tee', body: '#f4f2ed', accent: '#f4f2ed', trim: '#d9dbd6', team: 'HARRIERS', number: '04', sport: 'Running', gsm: 78 },
  { type: 'hoodie', body: '#1b1f21', accent: '#1b1f21', trim: '#2b2f32', team: 'BENCH', number: '01', sport: 'Training', gsm: 420 },
  { type: 'jersey', body: '#1b3fa8', accent: '#14307e', trim: '#f1efe8', team: 'DRAFT CC', number: '77', sport: 'Cycling', gsm: 135 },
]

export function Hero() {
  const [i, setI] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const garmentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setI((n) => (n + 1) % REEL.length), 3200)
    return () => clearInterval(t)
  }, [reduced])

  const current = REEL[i]

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-16">
      <div className="gutter">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* --- copy ---------------------------------------------------- */}
          <motion.div style={{ y: copyY, opacity: fade }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="eyebrow inline-flex items-center gap-2 rounded-xs border border-carbon-200 bg-white px-2.5 py-1.5 text-carbon-600"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-field-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-field-700" />
              </span>
              Floor is live · average lead time 5 days
            </motion.p>

            <h1 className="text-display-xl mt-6 font-display font-bold">
              {['MADE TO', 'ORDER.'].map((line, li) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, delay: 0.1 + li * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-carbon-300"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                >
                  NOT TO STOCK.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-7 max-w-md text-[15px] leading-relaxed text-carbon-600"
            >
              Competition-grade kit, printed one piece at a time. Build it in the studio, see
              exactly what the press will produce, and watch it move from artwork to doorstep.
              No minimum order. Nothing sitting in a warehouse waiting to be discounted.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button size="lg" asChild>
                <Link href="/studio">
                  <Wand2 />
                  Open the studio
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop">
                  Browse the shelf
                  <ArrowRight />
                </Link>
              </Button>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-carbon-200 pt-7"
            >
              {[
                ['1', 'Minimum order'],
                ['4', 'Print methods'],
                ['30d', 'Returns window'],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="tabular font-display text-2xl font-bold tracking-tight">{v}</dt>
                  <dd className="mt-1 text-xs text-carbon-500">{k}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* --- the reel ------------------------------------------------ */}
          <motion.div style={{ y: garmentY }} className="relative">
            <div className="grain relative aspect-square overflow-hidden rounded-xl bg-carbon-100 lg:aspect-[4/5]">
              <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />

              {/* The accent wash picks up whichever kit is showing. */}
              <AnimatePresence mode="sync">
                <motion.div
                  key={`wash-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.14 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1 }}
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(70% 55% at 50% 42%, ${current.body}, transparent 70%)`,
                  }}
                />
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.04, rotate: 1.5 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 p-10 lg:p-14"
                >
                  <Garment
                    type={current.type}
                    bodyHex={current.body}
                    accentHex={current.accent}
                    trimHex={current.trim}
                    customization={{
                      method: 'sublimation',
                      bodyHex: current.body,
                      accentHex: current.accent,
                      trimHex: current.trim,
                      teamName: current.team,
                      teamFont: 'block',
                      roster: [],
                      numberStyle: 'solid',
                      numberHex: current.trim,
                      artwork: [],
                      notes: '',
                    }}
                    title={`${current.sport} kit preview`}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Spec annotations — the technical read that signals this is a
                  manufacturer, not a dropshipper. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`meta-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45 }}
                    className="rounded-sm border border-carbon-200 bg-chalk/90 px-3 py-2 backdrop-blur-sm"
                  >
                    <p className="eyebrow text-carbon-500">{current.sport}</p>
                    <p className="tabular mt-1 text-xs font-medium">{current.gsm} gsm</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-1.5">
                  {REEL.map((_, n) => (
                    <button
                      key={n}
                      onClick={() => setI(n)}
                      className="pointer-events-auto h-1 w-7 overflow-hidden rounded-full bg-carbon-300"
                      aria-label={`Show ${REEL[n].sport} kit`}
                    >
                      <motion.span
                        className="block h-full bg-carbon-900"
                        initial={false}
                        animate={{ width: n === i ? '100%' : '0%' }}
                        transition={{ duration: n === i && !reduced ? 3.2 : 0.3, ease: 'linear' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
