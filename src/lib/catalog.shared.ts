/**
 * Display labels for catalogue facets.
 *
 * Separate from `catalog.ts` because that module is `server-only` (it talks
 * to Prisma), while filter chips, cards and the studio all need these strings
 * on the client.
 */

export const CATEGORY_LABELS: Record<string, string> = {
  jersey: 'Jerseys',
  tee: 'T-shirts',
  longsleeve: 'Long sleeve',
  tank: 'Tanks',
  hoodie: 'Hoodies',
  jacket: 'Jackets',
  shorts: 'Shorts',
  tights: 'Tights',
  cap: 'Caps',
}

export const SPORT_LABELS: Record<string, string> = {
  football: 'Football',
  basketball: 'Basketball',
  running: 'Running',
  training: 'Training',
  cycling: 'Cycling',
  multi: 'All sport',
}

export const FIT_LABELS: Record<string, string> = {
  compression: 'Compression',
  athletic: 'Athletic',
  regular: 'Regular',
  relaxed: 'Relaxed',
}

export const GENDER_LABELS: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  unisex: 'Unisex',
}

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
] as const
