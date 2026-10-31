import 'server-only'
import { db } from './db'
import type { GarmentType } from '@/art/garment-paths'

/* ===========================================================================
   Catalogue reads.

   SQLite has no array or JSON column type, so the schema stores those fields
   as JSON strings. Everything crossing out of this module is parsed and typed
   once here, so no page ever has to remember to JSON.parse a feature list.
   =========================================================================== */

export type VariantDTO = {
  id: string
  colorName: string
  bodyHex: string
  accentHex: string
  trimHex: string
  stock: Record<string, number>
  sizes: string[]
  inStock: boolean
}

export type ProductDTO = {
  id: string
  slug: string
  name: string
  blurb: string
  description: string
  category: GarmentType
  sport: string
  gender: string
  basePrice: number
  sku: string
  fabric: string
  weightGsm: number
  fit: string
  features: string[]
  careNotes: string
  customizable: boolean
  printZones: string[]
  badge: string | null
  rating: number
  reviews: number
  featured: boolean
  variants: VariantDTO[]
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

type RawProduct = Awaited<ReturnType<typeof db.product.findMany>>[number] & {
  variants: Awaited<ReturnType<typeof db.variant.findMany>>
}

function toDTO(p: RawProduct): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    blurb: p.blurb,
    description: p.description,
    category: p.category as GarmentType,
    sport: p.sport,
    gender: p.gender,
    basePrice: p.basePrice,
    sku: p.sku,
    fabric: p.fabric,
    weightGsm: p.weightGsm,
    fit: p.fit,
    features: parseJson<string[]>(p.features, []),
    careNotes: p.careNotes,
    customizable: p.customizable,
    printZones: parseJson<string[]>(p.printZones, ['front', 'back']),
    badge: p.badge,
    rating: p.rating,
    reviews: p.reviews,
    featured: p.featured,
    variants: p.variants.map((v) => {
      const stock = parseJson<Record<string, number>>(v.stock, {})
      return {
        id: v.id,
        colorName: v.colorName,
        bodyHex: v.bodyHex,
        accentHex: v.accentHex,
        trimHex: v.trimHex,
        stock,
        sizes: Object.keys(stock),
        inStock: Object.values(stock).some((n) => n > 0),
      }
    }),
  }
}

export type ShopFilters = {
  category?: string
  sport?: string
  gender?: string
  fit?: string
  maxPrice?: number
  search?: string
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
}

export async function getProducts(filters: ShopFilters = {}): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({
    where: {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.sport ? { sport: filters.sport } : {}),
      ...(filters.gender ? { gender: filters.gender } : {}),
      ...(filters.fit ? { fit: filters.fit } : {}),
      ...(filters.maxPrice ? { basePrice: { lte: filters.maxPrice } } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search } },
              { blurb: { contains: filters.search } },
              { fabric: { contains: filters.search } },
              { sport: { contains: filters.search } },
            ],
          }
        : {}),
    },
    include: { variants: true },
    orderBy:
      filters.sort === 'price-asc'
        ? { basePrice: 'asc' }
        : filters.sort === 'price-desc'
          ? { basePrice: 'desc' }
          : filters.sort === 'rating'
            ? { rating: 'desc' }
            : filters.sort === 'newest'
              ? { createdAt: 'desc' }
              : [{ featured: 'desc' }, { reviews: 'desc' }],
  })

  return rows.map(toDTO)
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  const row = await db.product.findUnique({ where: { slug }, include: { variants: true } })
  return row ? toDTO(row) : null
}

export async function getFeatured(limit = 4): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({
    where: { featured: true },
    include: { variants: true },
    take: limit,
    orderBy: { reviews: 'desc' },
  })
  return rows.map(toDTO)
}

/** Same sport first, then anything else, never the product itself. */
export async function getRelated(product: ProductDTO, limit = 4): Promise<ProductDTO[]> {
  const sameSport = await db.product.findMany({
    where: { sport: product.sport, NOT: { id: product.id } },
    include: { variants: true },
    take: limit,
  })
  if (sameSport.length >= limit) return sameSport.map(toDTO)

  const filler = await db.product.findMany({
    where: { NOT: { id: { in: [product.id, ...sameSport.map((p) => p.id)] } } },
    include: { variants: true },
    take: limit - sameSport.length,
  })
  return [...sameSport, ...filler].map(toDTO)
}

export async function getFacets() {
  const rows = await db.product.findMany({
    select: { category: true, sport: true, gender: true, fit: true, basePrice: true },
  })
  const count = (key: 'category' | 'sport' | 'gender' | 'fit') => {
    const m = new Map<string, number>()
    for (const r of rows) m.set(r[key], (m.get(r[key]) ?? 0) + 1)
    return [...m.entries()].map(([value, n]) => ({ value, n })).sort((a, b) => b.n - a.n)
  }
  return {
    categories: count('category'),
    sports: count('sport'),
    genders: count('gender'),
    fits: count('fit'),
    maxPrice: Math.max(...rows.map((r) => r.basePrice)),
    minPrice: Math.min(...rows.map((r) => r.basePrice)),
    total: rows.length,
  }
}

export {
  CATEGORY_LABELS,
  SPORT_LABELS,
  FIT_LABELS,
  GENDER_LABELS,
  SORT_OPTIONS,
} from './catalog.shared'
