'use client'

import { Plus, Trash2, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { RosterEntry } from '@/lib/customization'
import { NAME_PRICE, NUMBER_PRICE } from '@/lib/pricing'
import { cn, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * The roster is what makes this a team tool rather than a toy. Each row is a
 * physical garment with its own name, number and size, and the preview panel
 * renders whichever row is selected — so every shirt gets checked before the
 * order goes anywhere near the press.
 */
export function RosterEditor({
  roster,
  sizes,
  selectedIndex,
  onSelect,
  onChange,
}: {
  roster: RosterEntry[]
  sizes: string[]
  selectedIndex: number
  onSelect: (i: number) => void
  onChange: (next: RosterEntry[]) => void
}) {
  const totalUnits = roster.reduce((n, r) => n + r.quantity, 0)

  function addRow() {
    onChange([
      ...roster,
      {
        id: crypto.randomUUID(),
        playerName: '',
        number: '',
        size: sizes[Math.min(2, sizes.length - 1)] ?? sizes[0],
        quantity: 1,
      },
    ])
    onSelect(roster.length)
  }

  function update(i: number, patch: Partial<RosterEntry>) {
    onChange(roster.map((r, n) => (n === i ? { ...r, ...patch } : r)))
  }

  function remove(i: number) {
    onChange(roster.filter((_, n) => n !== i))
    if (selectedIndex >= roster.length - 1) onSelect(Math.max(0, roster.length - 2))
  }

  if (roster.length === 0) {
    return (
      <div className="grid-paper rounded-lg border border-dashed border-carbon-300 p-8 text-center">
        <Users className="mx-auto h-6 w-6 text-carbon-400" />
        <p className="mt-3 text-sm font-medium">No roster yet</p>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-carbon-500">
          Add a row per player and each shirt gets its own name, number and size — previewed one
          at a time. Names are {formatMoney(NAME_PRICE)}, numbers {formatMoney(NUMBER_PRICE)}.
        </p>
        <Button size="sm" variant="outline" className="mt-5" onClick={addRow}>
          <Plus />
          Add the first player
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Column heads — the grid matches each row below exactly. */}
      <div className="mb-2 grid grid-cols-[1fr_58px_72px_58px_32px] gap-2 px-1">
        {['Player name', 'No.', 'Size', 'Qty', ''].map((h, i) => (
          <span key={i} className="eyebrow text-carbon-400">
            {h}
          </span>
        ))}
      </div>

      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {roster.map((r, i) => (
            <motion.li
              key={r.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                onFocusCapture={() => onSelect(i)}
                onClick={() => onSelect(i)}
                className={cn(
                  'grid grid-cols-[1fr_58px_72px_58px_32px] items-center gap-2 rounded-sm border p-1.5 transition-colors',
                  i === selectedIndex
                    ? 'border-carbon-900 bg-white'
                    : 'border-carbon-200 bg-white/60 hover:border-carbon-300',
                )}
              >
                <Input
                  value={r.playerName}
                  onChange={(e) => update(i, { playerName: e.target.value.slice(0, 14) })}
                  placeholder="SURNAME"
                  maxLength={14}
                  aria-label={`Player ${i + 1} name`}
                  className="h-9 border-0 bg-transparent px-2 font-mono uppercase tracking-wide focus:ring-0"
                />
                <Input
                  value={r.number}
                  onChange={(e) =>
                    update(i, { number: e.target.value.replace(/\D/g, '').slice(0, 2) })
                  }
                  placeholder="00"
                  inputMode="numeric"
                  aria-label={`Player ${i + 1} number`}
                  className="tabular h-9 border-0 bg-transparent px-2 text-center focus:ring-0"
                />
                <select
                  value={r.size}
                  onChange={(e) => update(i, { size: e.target.value })}
                  aria-label={`Player ${i + 1} size`}
                  className="tabular h-9 rounded-xs border border-carbon-200 bg-white px-1.5 text-[13px] focus:border-field-700 focus:outline-none"
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={r.quantity}
                  onChange={(e) =>
                    update(i, { quantity: Math.max(1, Math.min(99, Number(e.target.value) || 1)) })
                  }
                  aria-label={`Player ${i + 1} quantity`}
                  className="tabular h-9 border-0 bg-transparent px-2 text-center focus:ring-0"
                />
                <button
                  onClick={() => remove(i)}
                  className="grid h-8 w-8 place-items-center rounded-xs text-carbon-400 transition-colors hover:bg-carbon-100 hover:text-danger"
                  aria-label={`Remove player ${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus />
          Add player
        </Button>
        <p className="tabular text-xs text-carbon-500">
          {roster.length} rows · {totalUnits} garment{totalUnits === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}
