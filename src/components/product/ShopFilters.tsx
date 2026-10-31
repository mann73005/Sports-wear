'use client'

import { useCallback, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import {
  CATEGORY_LABELS,
  FIT_LABELS,
  GENDER_LABELS,
  SORT_OPTIONS,
  SPORT_LABELS,
} from '@/lib/catalog.shared'
import { cn, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/misc'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type Facet = { value: string; n: number }

export type Facets = {
  categories: Facet[]
  sports: Facet[]
  genders: Facet[]
  fits: Facet[]
  minPrice: number
  maxPrice: number
  total: number
}

const GROUPS = [
  { key: 'category', title: 'Category', labels: CATEGORY_LABELS, facetKey: 'categories' },
  { key: 'sport', title: 'Discipline', labels: SPORT_LABELS, facetKey: 'sports' },
  { key: 'gender', title: 'Cut for', labels: GENDER_LABELS, facetKey: 'genders' },
  { key: 'fit', title: 'Fit', labels: FIT_LABELS, facetKey: 'fits' },
] as const

export function ShopFilters({ facets, resultCount }: { facets: Facets; resultCount: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value === null || next.get(key) === value) next.delete(key)
      else next.set(key, value)
      const qs = next.toString()
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router],
  )

  const active = GROUPS.flatMap((g) => {
    const v = params.get(g.key)
    return v ? [{ key: g.key, value: v, label: g.labels[v] ?? v }] : []
  })
  const maxPrice = params.get('maxPrice')
  const search = params.get('q')

  const clearAll = () => {
    const next = new URLSearchParams()
    const sort = params.get('sort')
    if (sort) next.set('sort', sort)
    startTransition(() => router.push(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false }))
  }

  const hasFilters = active.length > 0 || !!maxPrice || !!search

  const panel = (
    <div className="space-y-7">
      {GROUPS.map((g) => (
        <fieldset key={g.key}>
          <legend className="eyebrow mb-3 text-carbon-500">{g.title}</legend>
          <div className="flex flex-wrap gap-1.5">
            {facets[g.facetKey].map((f) => {
              const selected = params.get(g.key) === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setParam(g.key, f.value)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-sm border px-2.5 py-1.5 text-[13px] transition-all duration-150',
                    selected
                      ? 'border-carbon-900 bg-carbon-900 text-chalk'
                      : 'border-carbon-200 bg-white text-carbon-700 hover:border-carbon-400',
                  )}
                >
                  {g.labels[f.value] ?? f.value}
                  <span
                    className={cn(
                      'tabular ml-1.5 text-[11px]',
                      selected ? 'text-carbon-400' : 'text-carbon-400',
                    )}
                  >
                    {f.n}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="eyebrow mb-3 text-carbon-500">Max price</legend>
        <div className="flex flex-wrap gap-1.5">
          {[5000, 8000, 12000, 20000].map((p) => {
            const selected = maxPrice === String(p)
            return (
              <button
                key={p}
                onClick={() => setParam('maxPrice', String(p))}
                aria-pressed={selected}
                className={cn(
                  'tabular rounded-sm border px-2.5 py-1.5 text-[13px] transition-all duration-150',
                  selected
                    ? 'border-carbon-900 bg-carbon-900 text-chalk'
                    : 'border-carbon-200 bg-white text-carbon-700 hover:border-carbon-400',
                )}
              >
                Under {formatMoney(p)}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )

  return (
    <div className={cn('transition-opacity', pending && 'opacity-60')}>
      {/* --- control bar ------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-carbon-200 pb-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal />
                Filters
                {hasFilters ? (
                  <span className="tabular ml-1 grid h-4 w-4 place-items-center rounded-full bg-carbon-900 text-[10px] text-chalk">
                    {active.length + (maxPrice ? 1 : 0)}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto p-6">
              <SheetTitle className="font-display mb-6 text-xl">Filters</SheetTitle>
              {panel}
              <Button className="mt-8 w-full" onClick={() => setMobileOpen(false)}>
                Show {resultCount} result{resultCount === 1 ? '' : 's'}
              </Button>
            </SheetContent>
          </Sheet>

          <p className="tabular text-sm text-carbon-500">
            <span className="font-medium text-carbon-900">{resultCount}</span> of {facets.total}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="eyebrow text-carbon-500">Sort</span>
          <select
            value={params.get('sort') ?? 'featured'}
            onChange={(e) => setParam('sort', e.target.value === 'featured' ? null : e.target.value)}
            className="h-9 rounded-sm border border-carbon-200 bg-white px-2.5 text-[13px] transition-colors hover:border-carbon-400 focus:border-field-700 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* --- active chips ------------------------------------------------ */}
      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-2 py-4">
          {search ? (
            <Chip label={`"${search}"`} onClear={() => setParam('q', null)} />
          ) : null}
          {active.map((a) => (
            <Chip key={a.key} label={a.label} onClear={() => setParam(a.key, null)} />
          ))}
          {maxPrice ? (
            <Chip
              label={`Under ${formatMoney(Number(maxPrice))}`}
              onClear={() => setParam('maxPrice', null)}
            />
          ) : null}
          <button
            onClick={clearAll}
            className="ml-1 text-xs text-carbon-500 underline underline-offset-4 transition-colors hover:text-carbon-900"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {/* --- desktop rail ------------------------------------------------ */}
      <div className="hidden lg:block">
        <Separator className="my-6" />
        {panel}
      </div>
    </div>
  )
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="muted" className="gap-1 pr-1">
      {label}
      <button
        onClick={onClear}
        className="grid h-4 w-4 place-items-center rounded-full transition-colors hover:bg-carbon-300"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </Badge>
  )
}
