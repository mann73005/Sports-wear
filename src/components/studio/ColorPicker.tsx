'use client'

import { useId } from 'react'
import { Check, Pipette } from 'lucide-react'
import { cn, contrastOn } from '@/lib/utils'

/**
 * Kit palette. Deliberately a curated set rather than a full colour wheel —
 * these are the colours the dye house actually matches, and offering 16
 * million of them produces kit nobody wants to be seen in.
 */
export const KIT_PALETTE = [
  { name: 'Carbon', hex: '#1b1f21' },
  { name: 'Jet', hex: '#090a0a' },
  { name: 'Chalk', hex: '#f4f2ed' },
  { name: 'Bone', hex: '#e6e2d7' },
  { name: 'Slate', hex: '#5b6367' },
  { name: 'Field Green', hex: '#0e4234' },
  { name: 'Pitch', hex: '#177055' },
  { name: 'Forest', hex: '#0b3326' },
  { name: 'Royal', hex: '#1b3fa8' },
  { name: 'Navy', hex: '#14307e' },
  { name: 'Sky', hex: '#4a8fd4' },
  { name: 'Signal', hex: '#e8552f' },
  { name: 'Crimson', hex: '#a81f2e' },
  { name: 'Maroon', hex: '#6b1f2b' },
  { name: 'Amber', hex: '#d9961f' },
  { name: 'Volt', hex: '#c8d92a' },
  { name: 'Clay', hex: '#8a5a44' },
  { name: 'Plum', hex: '#542a52' },
]

export function ColorPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
  hint?: string
}) {
  const id = useId()
  const current = KIT_PALETTE.find((c) => c.hex.toLowerCase() === value.toLowerCase())

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="eyebrow text-carbon-500">{label}</span>
        <span className="text-xs font-medium">
          {current?.name ?? <span className="tabular uppercase">{value}</span>}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {KIT_PALETTE.map((c) => {
          const selected = c.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange(c.hex)}
              title={c.name}
              aria-label={c.name}
              aria-pressed={selected}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-sm transition-all duration-150',
                selected
                  ? 'ring-2 ring-carbon-900 ring-offset-2 ring-offset-chalk'
                  : 'ring-1 ring-carbon-200 hover:scale-110 hover:ring-carbon-400',
              )}
              style={{ backgroundColor: c.hex }}
            >
              {selected ? (
                <Check className="h-3.5 w-3.5" style={{ color: contrastOn(c.hex) }} />
              ) : null}
            </button>
          )
        })}

        {/* Escape hatch for a club that has to match an existing PMS. */}
        <label
          htmlFor={id}
          title="Custom colour"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-sm border border-dashed border-carbon-300 transition-colors hover:border-carbon-500 hover:bg-carbon-100"
        >
          <Pipette className="h-3.5 w-3.5 text-carbon-500" />
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="sr-only">Pick a custom colour</span>
        </label>
      </div>

      {hint ? <p className="mt-2 text-xs text-carbon-500">{hint}</p> : null}
    </div>
  )
}
