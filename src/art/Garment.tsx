import { cn } from '@/lib/utils'
import type { Customization } from '@/lib/customization'
import {
  CANVAS,
  PLACEMENT_VIEW,
  PRINT_BOXES,
  TEXT_ANCHORS,
  shapeFor,
  type GarmentType,
  type View,
} from './garment-paths'

/* ===========================================================================
   The garment.

   One component draws every piece of kit on the site. Product cards, the PDP
   gallery, the cart thumbnails and the live studio preview all call it, so a
   jersey looks identical wherever it appears — and the thing the customer
   approves in the studio is literally the thing printed on their order sheet.

   Pure and deterministic: no hooks, no randomness. Safe in server components.
   =========================================================================== */

export type GarmentProps = {
  type: GarmentType
  view?: View
  bodyHex: string
  accentHex: string
  trimHex: string
  /** When present, the print spec is drawn on top of the garment. */
  customization?: Customization | null
  /** Which roster entry to preview on the back. */
  rosterIndex?: number
  /** Drop shadow + ground contact. Off for tiny thumbnails. */
  shadow?: boolean
  className?: string
  title?: string
}

/**
 * Gradient/clip ids have to be stable between server and client render, so
 * they are derived from the props rather than a counter. Two garments with
 * identical paint share identical <defs>, which is harmless.
 */
function uidFor(p: GarmentProps) {
  return `g${[p.type, p.view ?? 'front', p.bodyHex, p.accentHex, p.trimHex]
    .join('')
    .replace(/[^a-z0-9]/gi, '')}`
}

const DISPLAY = { fontFamily: 'var(--font-display), "Arial Black", sans-serif' } as const
const SCRIPT = { fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' } as const

export function Garment(props: GarmentProps) {
  const {
    type,
    view = 'front',
    bodyHex,
    accentHex,
    trimHex,
    customization: c = null,
    rosterIndex = 0,
    shadow = true,
    className,
    title,
  } = props

  const shape = shapeFor(type, view)
  const uid = uidFor(props)

  // A customised garment repaints the whole piece — the studio's colour
  // pickers write straight into these slots.
  const body = c?.bodyHex ?? bodyHex
  const accent = c?.accentHex ?? accentHex
  const trim = c?.trimHex ?? trimHex

  const roster = c?.roster ?? []
  const entry = roster[rosterIndex] ?? roster[0] ?? null

  const artworkHere = (c?.artwork ?? []).filter((a) => PLACEMENT_VIEW[a.placement] === view)

  return (
    <svg
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      className={cn('h-full w-full', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        {/* Volume. A single soft diagonal does more than any amount of
            hand-placed highlight, and survives any body colour. */}
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>

        {/* Centre-of-chest sheen so flat colours don't read as paper. */}
        <radialGradient id={`${uid}-sheen`} cx="0.42" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Everything printed is clipped to actual fabric, so a logo can
            never float off the edge of the garment. */}
        <clipPath id={`${uid}-fabric`}>
          <path d={shape.body} />
          {shape.accent.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>

        {shadow ? (
          <filter id={`${uid}-drop`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0b0c0c" floodOpacity="0.22" />
          </filter>
        ) : null}

        <path id={`${uid}-arc`} d="M 116 158 Q 180 134 244 158" fill="none" />
      </defs>

      {shadow ? (
        <ellipse
          cx={CANVAS.cx}
          cy={shape.ground?.y ?? 424}
          rx={shape.ground?.rx ?? 104}
          ry="11"
          fill="#0b0c0c"
          opacity="0.1"
        />
      ) : null}

      <g filter={shadow ? `url(#${uid}-drop)` : undefined}>
        {/* --- fabric ---------------------------------------------------- */}
        {/* Behind the torso first — a hood only reads correctly when the
            body crops it, rather than sitting on top of the chest. */}
        {shape.behind?.map((d, i) => (
          <g key={`b${i}`}>
            <path d={d} fill={accent} />
            <path d={d} fill={`url(#${uid}-shade)`} opacity="0.7" />
            <path d={d} fill="none" stroke="#0b0c0c" strokeOpacity="0.14" strokeWidth="1.2" />
          </g>
        ))}
        <path d={shape.body} fill={body} />
        {shape.accent.map((d, i) => (
          <path key={`a${i}`} d={d} fill={accent} />
        ))}
        {shape.overlay?.map((d, i) => (
          <path key={`o${i}`} d={d} fill={body} opacity="0.92" />
        ))}

        {/* --- printing -------------------------------------------------- */}
        <g clipPath={`url(#${uid}-fabric)`}>
          {artworkHere.map((a, i) => {
            const box = PRINT_BOXES[a.placement]
            if (!box) return null
            const w = box.w * a.scale
            const h = box.h * a.scale
            return (
              <image
                key={`art${i}`}
                href={a.dataUrl}
                x={box.x + box.w * a.x - w / 2}
                y={box.y + box.h * a.y - h / 2}
                width={w}
                height={h}
                preserveAspectRatio="xMidYMid meet"
              />
            )
          })}

          {view === 'front' && c?.teamName?.trim() ? (
            <text
              x={TEXT_ANCHORS.teamName.x}
              y={TEXT_ANCHORS.teamName.y}
              textAnchor="middle"
              fill={c.numberHex}
              style={c.teamFont === 'script' ? SCRIPT : DISPLAY}
              fontSize={c.teamFont === 'condensed' ? 30 : 26}
              fontWeight="700"
              letterSpacing={c.teamFont === 'condensed' ? '-0.02em' : '0.02em'}
              transform={
                c.teamFont === 'condensed'
                  ? `translate(${TEXT_ANCHORS.teamName.x} 0) scale(0.76 1) translate(${-TEXT_ANCHORS.teamName.x} 0)`
                  : undefined
              }
              textLength={
                c.teamName.length > 10 ? TEXT_ANCHORS.teamName.maxWidth : undefined
              }
              lengthAdjust="spacingAndGlyphs"
            >
              {c.teamFont === 'script' ? c.teamName : c.teamName.toUpperCase()}
            </text>
          ) : null}

          {view === 'back' && entry ? (
            <>
              {entry.playerName.trim() ? (
                <text
                  fill={c!.numberHex}
                  style={DISPLAY}
                  fontSize="21"
                  fontWeight="700"
                  letterSpacing="0.06em"
                >
                  <textPath href={`#${uid}-arc`} startOffset="50%" textAnchor="middle">
                    {entry.playerName.toUpperCase()}
                  </textPath>
                </text>
              ) : null}

              {entry.number.trim() ? <Number spec={c!} value={entry.number} /> : null}
            </>
          ) : null}
        </g>

        {/* --- shading over the print, so ink picks up the garment's form --- */}
        <path d={shape.body} fill={`url(#${uid}-shade)`} />
        <path d={shape.body} fill={`url(#${uid}-sheen)`} />
        {shape.accent.map((d, i) => (
          <path key={`as${i}`} d={d} fill={`url(#${uid}-shade)`} opacity="0.85" />
        ))}

        {/* --- construction ---------------------------------------------- */}
        {shape.seams.map((d, i) => (
          <path
            key={`s${i}`}
            d={d}
            fill="none"
            stroke="#000"
            strokeOpacity="0.16"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}
        {shape.trim.map((d, i) => (
          <path
            key={`t${i}`}
            d={d}
            fill="none"
            stroke={trim}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Outline last: a hairline keeps pale garments legible on chalk. */}
        <path d={shape.body} fill="none" stroke="#0b0c0c" strokeOpacity="0.14" strokeWidth="1.2" />
        {shape.accent.map((d, i) => (
          <path
            key={`ao${i}`}
            d={d}
            fill="none"
            stroke="#0b0c0c"
            strokeOpacity="0.12"
            strokeWidth="1.2"
          />
        ))}
      </g>
    </svg>
  )
}

/** The squad number. Three finishes, because they price and print differently. */
function Number({ spec, value }: { spec: Customization; value: string }) {
  const common = {
    x: TEXT_ANCHORS.number.x,
    y: TEXT_ANCHORS.number.y,
    textAnchor: 'middle' as const,
    style: DISPLAY,
    fontSize: 116,
    fontWeight: '700',
    letterSpacing: '-0.04em',
  }

  if (spec.numberStyle === 'outline') {
    return (
      <text {...common} fill="none" stroke={spec.numberHex} strokeWidth="4">
        {value}
      </text>
    )
  }

  if (spec.numberStyle === 'shadow') {
    return (
      <>
        <text {...common} x={common.x + 5} y={common.y + 5} fill="#000" opacity="0.4">
          {value}
        </text>
        <text {...common} fill={spec.numberHex}>
          {value}
        </text>
      </>
    )
  }

  return (
    <text {...common} fill={spec.numberHex}>
      {value}
    </text>
  )
}
