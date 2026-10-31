import { PLACEMENTS, PRINT_METHODS, parseCustomization, type PlacementId } from '@/lib/customization'
import { formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import type { GarmentType } from '@/art/garment-paths'
import { Badge } from '@/components/ui/badge'

export type OrderItemRow = {
  id: string
  productSlug: string
  name: string
  sku: string
  category: string
  size: string
  colorName: string
  bodyHex: string
  accentHex: string
  trimHex: string
  quantity: number
  unitPrice: number
  printCost: number
  lineTotal: number
  customization: string | null
}

/**
 * One line of an order, rendered as a production spec sheet.
 *
 * This is the same component on the customer's order page and in the admin
 * console, deliberately: what the customer approved and what the operator
 * makes are read off one artefact, so there is no gap for a misprint to fall
 * through. The garment is redrawn from the stored spec rather than an image,
 * so it is always an accurate render of what was bought.
 */
export function SpecSheet({ item, showCosts = true }: { item: OrderItemRow; showCosts?: boolean }) {
  const spec = parseCustomization(item.customization)
  const roster = spec?.roster ?? []
  const named = roster.filter((r) => r.playerName.trim() || r.number.trim())

  return (
    <div className="rounded-lg border border-carbon-200 bg-white">
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        {/* Front and back, because the back is where the roster lands. */}
        <div className="flex shrink-0 gap-2">
          {(['front', 'back'] as const).map((view) => (
            <span
              key={view}
              className="relative h-28 w-24 overflow-hidden rounded-sm bg-carbon-100"
            >
              <div className="grid-paper absolute inset-0 opacity-40" aria-hidden />
              <div className="absolute inset-0 p-2">
                <Garment
                  type={item.category as GarmentType}
                  view={view}
                  bodyHex={item.bodyHex}
                  accentHex={item.accentHex}
                  trimHex={item.trimHex}
                  customization={spec}
                  shadow={false}
                  title={`${item.name}, ${view}`}
                />
              </div>
              <span className="eyebrow absolute bottom-1 left-1.5 text-carbon-400">{view}</span>
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="tabular mt-1 text-xs text-carbon-500">
                {item.sku} · {item.colorName} · {item.size}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular text-sm font-medium">
                {showCosts ? formatMoney(item.lineTotal) : null}
              </p>
              <p className="tabular text-xs text-carbon-500">
                {item.quantity} piece{item.quantity === 1 ? '' : 's'}
                {showCosts ? ` · ${formatMoney(item.unitPrice)} base` : ''}
              </p>
            </div>
          </div>

          {spec ? (
            <>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                <Badge variant="brand">{PRINT_METHODS[spec.method].label}</Badge>
                {spec.teamName ? (
                  <Badge variant="outline">
                    Chest: {spec.teamName} ({spec.teamFont})
                  </Badge>
                ) : null}
                {spec.artwork.map((a) => (
                  <Badge key={a.placement} variant="outline">
                    {PLACEMENTS[a.placement as PlacementId].label} · {Math.round(a.scale * 100)}%
                  </Badge>
                ))}
                {showCosts && item.printCost > 0 ? (
                  <Badge variant="muted">{formatMoney(item.printCost)} print / unit</Badge>
                ) : null}
              </div>

              {/* Paint slots, as hex, so the dye house has exact values. */}
              <dl className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2">
                {(
                  [
                    ['Body', spec.bodyHex],
                    ['Panels', spec.accentHex],
                    ['Trim', spec.trimHex],
                    ['Print', spec.numberHex],
                  ] as const
                ).map(([label, hex]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className="h-3.5 w-3.5 rounded-xs ring-1 ring-inset ring-black/15"
                      style={{ backgroundColor: hex }}
                    />
                    <dt className="eyebrow text-carbon-400">{label}</dt>
                    <dd className="tabular text-[11px] uppercase text-carbon-600">{hex}</dd>
                  </div>
                ))}
              </dl>

              {named.length > 0 ? (
                <div className="mt-4 overflow-x-auto rounded-sm border border-carbon-100">
                  <table className="w-full text-[13px]">
                    <caption className="sr-only">Roster for {item.name}</caption>
                    <thead>
                      <tr className="border-b border-carbon-100 bg-carbon-50">
                        {['No.', 'Player', 'Size', 'Qty'].map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="eyebrow px-3 py-2 text-left text-carbon-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((r) => (
                        <tr key={r.id} className="border-b border-carbon-50 last:border-0">
                          <td className="tabular px-3 py-1.5 font-medium">{r.number || '—'}</td>
                          <td className="px-3 py-1.5 font-mono uppercase tracking-wide">
                            {r.playerName || <span className="text-carbon-400">unnamed</span>}
                          </td>
                          <td className="tabular px-3 py-1.5">{r.size}</td>
                          <td className="tabular px-3 py-1.5">{r.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {spec.notes ? (
                <p className="mt-3.5 rounded-sm bg-warn/10 p-3 text-[13px] leading-relaxed text-carbon-700">
                  <span className="eyebrow mb-1 block text-warn">Note for the floor</span>
                  {spec.notes}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-[13px] text-carbon-500">
              Stock piece — no print work. Picked and packed as-is.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
