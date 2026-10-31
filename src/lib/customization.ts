import { z } from 'zod'

/* ===========================================================================
   The print spec.

   This is the contract between three parties: the studio UI writes it, the
   pricing engine costs it, and the production floor reads it back off the
   order to actually make the garment. It is stored as JSON on OrderItem, so
   once an order exists the spec is frozen — later catalogue edits can't
   retroactively change what someone bought.
   =========================================================================== */

export const PRINT_METHODS = {
  screen: {
    id: 'screen',
    label: 'Screen print',
    note: 'Thick opaque ink. Best for bold flat shapes and big blocks of colour.',
    setupFee: 1200, // cents, charged once per order per placement
    perPlacement: 450,
    maxColors: 4,
    bestFor: 'Flat logos, large runs',
  },
  sublimation: {
    id: 'sublimation',
    label: 'Dye sublimation',
    note: 'Ink becomes part of the fibre. Zero hand-feel, will not crack. Polyester only.',
    setupFee: 0,
    perPlacement: 700,
    maxColors: Infinity,
    bestFor: 'Photographic art, all-over prints',
  },
  embroidery: {
    id: 'embroidery',
    label: 'Embroidery',
    note: 'Stitched thread. The premium finish — heavier, textured, permanent.',
    setupFee: 2500,
    perPlacement: 1100,
    maxColors: 6,
    bestFor: 'Crests, small marks, caps',
  },
  dtf: {
    id: 'dtf',
    label: 'DTF transfer',
    note: 'Heat-applied film. Full colour with no setup — the fastest route to one-offs.',
    setupFee: 0,
    perPlacement: 550,
    maxColors: Infinity,
    bestFor: 'Single pieces, fine detail',
  },
} as const

export type PrintMethodId = keyof typeof PRINT_METHODS

export const PLACEMENTS = {
  front: { id: 'front', label: 'Front chest', view: 'front', maxArea: 'A3' },
  back: { id: 'back', label: 'Full back', view: 'back', maxArea: 'A3' },
  'left-sleeve': { id: 'left-sleeve', label: 'Left sleeve', view: 'front', maxArea: 'A6' },
  'right-sleeve': { id: 'right-sleeve', label: 'Right sleeve', view: 'front', maxArea: 'A6' },
  'back-neck': { id: 'back-neck', label: 'Back neck', view: 'back', maxArea: 'A7' },
} as const

export type PlacementId = keyof typeof PLACEMENTS

/** A single roster entry — one physical garment with its own name/number. */
export const rosterEntrySchema = z.object({
  id: z.string(),
  playerName: z.string().max(14, 'Max 14 characters — longer will not fit the back panel'),
  number: z.string().max(2, 'Numbers are two digits'),
  size: z.string(),
  quantity: z.number().int().min(1).max(99),
})

export type RosterEntry = z.infer<typeof rosterEntrySchema>

export const artworkSchema = z.object({
  placement: z.enum(['front', 'back', 'left-sleeve', 'right-sleeve', 'back-neck']),
  /** data: URL of the uploaded mark. Kept small — see MAX_ARTWORK_BYTES. */
  dataUrl: z.string(),
  fileName: z.string(),
  /** Normalised 0..1 position and scale within the placement's print box. */
  x: z.number().min(0).max(1).default(0.5),
  y: z.number().min(0).max(1).default(0.5),
  scale: z.number().min(0.2).max(1).default(0.7),
})

export type Artwork = z.infer<typeof artworkSchema>

export const customizationSchema = z.object({
  method: z.enum(['screen', 'sublimation', 'embroidery', 'dtf']),

  /** Paint slots on the garment — overrides the variant's stock colourway. */
  bodyHex: z.string(),
  accentHex: z.string(),
  trimHex: z.string(),

  /** Team / club wordmark across the chest. */
  teamName: z.string().max(16).default(''),
  teamFont: z.enum(['block', 'condensed', 'script']).default('block'),

  /** Name + number on the back. Empty roster means a plain garment. */
  roster: z.array(rosterEntrySchema).default([]),
  numberStyle: z.enum(['solid', 'outline', 'shadow']).default('solid'),
  numberHex: z.string().default('#ffffff'),

  artwork: z.array(artworkSchema).default([]),

  notes: z.string().max(400).default(''),
})

export type Customization = z.infer<typeof customizationSchema>

export const MAX_ARTWORK_BYTES = 600_000

export function emptyCustomization(
  bodyHex: string,
  accentHex: string,
  trimHex: string,
): Customization {
  return {
    method: 'dtf',
    bodyHex,
    accentHex,
    trimHex,
    teamName: '',
    teamFont: 'block',
    roster: [],
    numberStyle: 'solid',
    numberHex: '#ffffff',
    artwork: [],
    notes: '',
  }
}

/** True when the user has actually changed something worth printing. */
export function isCustomized(c: Customization, base: Customization) {
  return (
    c.teamName.trim() !== '' ||
    c.roster.length > 0 ||
    c.artwork.length > 0 ||
    c.bodyHex !== base.bodyHex ||
    c.accentHex !== base.accentHex ||
    c.trimHex !== base.trimHex
  )
}

export function parseCustomization(json: string | null): Customization | null {
  if (!json) return null
  try {
    const parsed = customizationSchema.safeParse(JSON.parse(json))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
