'use client'

import { useRef, useState } from 'react'
import { AlertTriangle, ImageUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  MAX_ARTWORK_BYTES,
  PLACEMENTS,
  type Artwork,
  type PlacementId,
} from '@/lib/customization'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/misc'

/**
 * Artwork upload and placement.
 *
 * Files are held as data URLs so the whole spec is one self-contained JSON
 * blob — it survives a refresh in localStorage and lands on the order intact,
 * with no separate asset store to go out of sync with the line it belongs to.
 * That is also why the ceiling is deliberately low.
 */
export function ArtworkEditor({
  artwork,
  allowedZones,
  onChange,
}: {
  artwork: Artwork[]
  allowedZones: string[]
  onChange: (next: Artwork[]) => void
}) {
  const [target, setTarget] = useState<PlacementId>(
    (allowedZones[0] as PlacementId) ?? 'front',
  )
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const zones = allowedZones.filter((z): z is PlacementId => z in PLACEMENTS)

  function accept(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('That is not an image', { description: 'PNG, SVG or JPG only.' })
      return
    }
    if (file.size > MAX_ARTWORK_BYTES) {
      toast.error('Artwork is too large', {
        description: `Keep it under ${Math.round(MAX_ARTWORK_BYTES / 1000)} KB. A vector SVG is almost always smaller and prints sharper.`,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const next: Artwork = {
        placement: target,
        dataUrl: String(reader.result),
        fileName: file.name,
        x: 0.5,
        y: 0.5,
        scale: 0.7,
      }
      // One mark per placement — a second upload replaces the first.
      onChange([...artwork.filter((a) => a.placement !== target), next])
      toast.success('Artwork placed', { description: PLACEMENTS[target].label })
    }
    reader.readAsDataURL(file)
  }

  function patch(placement: string, p: Partial<Artwork>) {
    onChange(artwork.map((a) => (a.placement === placement ? { ...a, ...p } : a)))
  }

  return (
    <div className="space-y-5">
      {/* --- where ------------------------------------------------------- */}
      <div>
        <span className="eyebrow mb-2.5 block text-carbon-500">Placement</span>
        <div className="flex flex-wrap gap-1.5">
          {zones.map((z) => {
            const used = artwork.some((a) => a.placement === z)
            return (
              <button
                key={z}
                onClick={() => setTarget(z)}
                aria-pressed={target === z}
                className={cn(
                  'relative rounded-sm border px-2.5 py-1.5 text-[13px] transition-all duration-150',
                  target === z
                    ? 'border-carbon-900 bg-carbon-900 text-chalk'
                    : 'border-carbon-200 bg-white hover:border-carbon-400',
                )}
              >
                {PLACEMENTS[z].label}
                {used ? (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-field-500" />
                ) : null}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-carbon-500">
          Max print area at this placement: {PLACEMENTS[target].maxArea}
        </p>
      </div>

      {/* --- drop zone --------------------------------------------------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) accept(f)
        }}
        className={cn(
          'grid-paper rounded-lg border border-dashed p-6 text-center transition-colors',
          dragging ? 'border-field-700 bg-field-700/5' : 'border-carbon-300',
        )}
      >
        <ImageUp className="mx-auto h-6 w-6 text-carbon-400" />
        <p className="mt-3 text-sm font-medium">Drop a crest or logo</p>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-carbon-500">
          SVG prints sharpest at any size. PNG with a transparent background also works. Under{' '}
          {Math.round(MAX_ARTWORK_BYTES / 1000)} KB.
        </p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
          Choose a file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) accept(f)
            e.target.value = ''
          }}
        />
      </div>

      {/* --- placed marks ------------------------------------------------ */}
      {artwork.length > 0 ? (
        <ul className="space-y-2.5">
          {artwork.map((a) => (
            <li key={a.placement} className="rounded-lg border border-carbon-200 bg-white p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-sm border border-carbon-200 bg-carbon-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.dataUrl} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{a.fileName}</p>
                  <p className="text-xs text-carbon-500">
                    {PLACEMENTS[a.placement as PlacementId].label}
                  </p>
                </div>
                <button
                  onClick={() => onChange(artwork.filter((x) => x.placement !== a.placement))}
                  className="grid h-8 w-8 place-items-center rounded-xs text-carbon-400 transition-colors hover:bg-carbon-100 hover:text-danger"
                  aria-label={`Remove artwork from ${a.placement}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 grid gap-3.5">
                {([
                  ['Size', 'scale', 0.2, 1],
                  ['Across', 'x', 0.1, 0.9],
                  ['Down', 'y', 0.1, 0.9],
                ] as const).map(([label, key, min, max]) => (
                  <label key={key} className="grid grid-cols-[52px_1fr_38px] items-center gap-3">
                    <span className="eyebrow text-carbon-500">{label}</span>
                    <Slider
                      value={[a[key]]}
                      min={min}
                      max={max}
                      step={0.01}
                      onValueChange={([v]) => patch(a.placement, { [key]: v } as Partial<Artwork>)}
                      aria-label={`${label} for ${a.placement}`}
                    />
                    <span className="tabular text-right text-[11px] text-carbon-500">
                      {Math.round(a[key] * 100)}
                    </span>
                  </label>
                ))}
              </div>

              {a.scale > 0.92 ? (
                <p className="mt-3 flex items-start gap-2 rounded-sm bg-warn/10 p-2.5 text-xs text-warn">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  At this size the mark reaches the edge of the print box. A low-resolution file
                  will show it.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
