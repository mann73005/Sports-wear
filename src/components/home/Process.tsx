'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Garment } from '@/art/Garment'
import type { Customization } from '@/lib/customization'

/* The same garment at three stages of being specified. The sticky panel
   advances through them as the steps scroll past, so the explanation and the
   artefact are never out of sync. */

const BASE = { bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#e8e5dc' }

const STAGES: Customization[] = [
  {
    method: 'sublimation',
    ...BASE,
    teamName: '',
    teamFont: 'block',
    roster: [],
    numberStyle: 'solid',
    numberHex: '#e8e5dc',
    artwork: [],
    notes: '',
  },
  {
    method: 'sublimation',
    ...BASE,
    teamName: 'NORTHGATE',
    teamFont: 'block',
    roster: [],
    numberStyle: 'solid',
    numberHex: '#e8e5dc',
    artwork: [],
    notes: '',
  },
  {
    method: 'sublimation',
    ...BASE,
    teamName: 'NORTHGATE',
    teamFont: 'block',
    roster: [{ id: 'x', playerName: 'OKONJO', number: '4', size: 'L', quantity: 1 }],
    numberStyle: 'solid',
    numberHex: '#e8e5dc',
    artwork: [],
    notes: '',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Pick the blank',
    body: 'Start from a real garment, not a template. Every piece on the shelf lists its fabric, its weight in grams per square metre and its cut, because those are the three things that decide whether it is right for you.',
    meta: ['17 blanks', '9 categories', '5 disciplines'],
  },
  {
    n: '02',
    title: 'Put your mark on it',
    body: 'Repaint the body, the panels and the trim. Set a chest wordmark, drop in a crest, pick a print method. The price updates as you go — there is no quote to wait for and nothing hidden until checkout.',
    meta: ['4 print methods', '5 placements', 'Live pricing'],
  },
  {
    n: '03',
    title: 'Name the squad',
    body: 'Add a roster and every shirt gets its own name and number, previewed one at a time so you can check each before it is made. Volume breaks apply automatically from six pieces.',
    meta: ['Per-shirt preview', 'Mixed sizes', 'Up to 22% off'],
  },
]

export function Process() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end end'] })

  return (
    <section ref={ref} className="gutter py-20 lg:py-28">
      <header className="max-w-2xl">
        <p className="eyebrow text-carbon-500">[ 01 ] How it works</p>
        <h2 className="text-display-lg mt-4 font-display font-bold">
          Three decisions
          <br />
          <span className="text-carbon-300">and it is on the press.</span>
        </h2>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* sticky artefact */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-28">
            <StickyGarment progress={scrollYProgress} />
          </div>
        </div>

        {/* steps */}
        <ol className="order-1 space-y-4 lg:order-2">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-lg border border-carbon-200 bg-white p-6 lg:p-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="tabular font-display text-3xl font-bold text-carbon-200">
                  {s.n}
                </span>
                <h3 className="text-display-sm font-display font-bold">{s.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-carbon-600">{s.body}</p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-carbon-100 pt-4">
                {s.meta.map((m) => (
                  <li key={m} className="eyebrow text-carbon-500">
                    {m}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function StickyGarment({ progress }: { progress: MotionValue<number> }) {
  // Crossfade the three stages across the scroll range rather than snapping,
  // so the wordmark and the number appear to be applied rather than swapped.
  const o0 = useTransform(progress, [0, 0.28, 0.36], [1, 1, 0])
  const o1 = useTransform(progress, [0.28, 0.36, 0.62, 0.7], [0, 1, 1, 0])
  const o2 = useTransform(progress, [0.62, 0.7, 1], [0, 1, 1])
  const view = useTransform(progress, (v): string => (v > 0.66 ? 'back' : 'front'))
  const labelOpacity = useTransform(progress, [0, 0.05], [0, 1])

  return (
    <div className="grain relative aspect-[4/5] overflow-hidden rounded-xl bg-carbon-100">
      <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />

      {[o0, o1].map((opacity, i) => (
        <motion.div key={i} style={{ opacity }} className="absolute inset-0 p-10 lg:p-14">
          <Garment
            type="jersey"
            view="front"
            {...BASE}
            customization={STAGES[i]}
            title={i === 0 ? 'Blank match jersey' : 'Jersey with a chest wordmark'}
          />
        </motion.div>
      ))}

      {/* Stage three flips to the back so the number is actually visible. */}
      <motion.div style={{ opacity: o2 }} className="absolute inset-0 p-10 lg:p-14">
        <Garment
          type="jersey"
          view="back"
          {...BASE}
          customization={STAGES[2]}
          title="Jersey back with player name and number"
        />
      </motion.div>

      <motion.p
        className="eyebrow absolute left-5 top-5 rounded-xs border border-carbon-200 bg-chalk/90 px-2.5 py-1.5 text-carbon-600 backdrop-blur-sm"
        style={{ opacity: labelOpacity }}
      >
        <motion.span>{view}</motion.span> view · live preview
      </motion.p>
    </div>
  )
}
