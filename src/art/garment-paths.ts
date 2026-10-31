/* ===========================================================================
   Garment outlines.

   Everything is drawn on a 360 x 440 canvas with the centre line at x = 180,
   so a shape can be mirrored by reflecting about 180. Coordinates were tuned
   by eye against real pattern blocks: shoulder at y 76, armpit at y 146,
   hem at y 398.
   =========================================================================== */

export const CANVAS = { w: 360, h: 440, cx: 180 } as const

export type GarmentType =
  | 'jersey'
  | 'longsleeve'
  | 'tee'
  | 'tank'
  | 'hoodie'
  | 'jacket'
  | 'shorts'
  | 'tights'
  | 'cap'

export type View = 'front' | 'back'

/* --- torso ---------------------------------------------------------------- */

/** Crew-neck torso. The neck scoop is cut out by the collar shape on top. */
const TORSO_CREW = `
  M 105 76
  L 148 66
  C 158 97, 202 97, 212 66
  L 255 76
  C 263 142, 266 262, 264 398
  L 96 398
  C 94 262, 97 142, 105 76
  Z
`

/** V-neck torso — used by the match jerseys. */
const TORSO_V = `
  M 105 76
  L 150 67
  L 180 112
  L 210 67
  L 255 76
  C 263 142, 266 262, 264 398
  L 96 398
  C 94 262, 97 142, 105 76
  Z
`

/** Backs have a shallow, high neckline whatever the front does. */
const TORSO_BACK = `
  M 105 76
  L 150 68
  C 160 84, 200 84, 210 68
  L 255 76
  C 263 142, 266 262, 264 398
  L 96 398
  C 94 262, 97 142, 105 76
  Z
`

/** Tank: narrow straps and a deep scooped armhole. */
const TORSO_TANK = `
  M 128 78
  L 156 70
  C 164 100, 196 100, 204 70
  L 232 78
  C 248 104, 258 150, 260 200
  C 262 280, 264 350, 264 398
  L 96 398
  C 96 350, 98 280, 100 200
  C 102 150, 112 104, 128 78
  Z
`

/* --- sleeves -------------------------------------------------------------- */

/** Set-in short sleeve, left side. Mirror about x=180 for the right. */
const SLEEVE_SHORT = `
  M 105 76
  C 82 83, 58 101, 42 128
  L 33 158
  L 92 187
  L 107 146
  C 102 118, 102 94, 105 76
  Z
`

const SLEEVE_LONG = `
  M 105 76
  C 82 83, 58 101, 42 128
  L 18 262
  L 64 276
  L 107 146
  C 102 118, 102 94, 105 76
  Z
`

/* --- outerwear ------------------------------------------------------------ */

/**
 * The hood sits BEHIND the torso (see `behind` on GarmentShape), so only the
 * crown clears the shoulder line — which is what a hood actually looks like
 * from the front. Painted over the body instead, it reads as a floating head.
 */
/**
 * Flat and wide, not a dome. A tall rounded hood reads as a head; a shallow
 * roll that spans most of the shoulder width reads as bunched fabric. The
 * collar band drawn over its base finishes the separation.
 */
const HOOD = `
  M 116 120
  C 114 72, 142 56, 180 56
  C 218 56, 246 72, 244 120
  C 206 134, 154 134, 116 120
  Z
`

/** Drawstrings, drawn as seams so they pick up the stitch colour. */
const DRAWSTRINGS = [
  'M 166 88 L 163 150',
  'M 194 88 L 197 150',
]

const POCKET = `
  M 118 286
  L 242 286
  L 238 352
  L 122 352
  Z
`

/* --- legwear -------------------------------------------------------------- */

const SHORTS = `
  M 96 92
  L 264 92
  C 268 140, 268 180, 262 214
  L 246 358
  L 192 358
  L 180 212
  L 168 358
  L 114 358
  L 98 214
  C 92 180, 92 140, 96 92
  Z
`

const TIGHTS = `
  M 100 70
  L 260 70
  C 264 120, 262 170, 256 212
  L 238 418
  L 192 418
  L 180 214
  L 168 418
  L 122 418
  L 104 212
  C 98 170, 96 120, 100 70
  Z
`

/* --- headwear ------------------------------------------------------------- */

/* Front view. The crown is a six-panel dome, the brim a wide lens beneath it
   spanning well past the crown on both sides — which is what reads as a cap
   rather than a helmet. */

// Roughly 1.6:1 width to height. Taller than that and it reads as a bonnet.
const CAP_CROWN = `
  M 96 258
  C 96 190, 132 152, 180 152
  C 228 152, 264 190, 264 258
  Z
`

// Wider than the crown and shallow — a brim seen head-on is foreshortened,
// so depth here is what makes it look like a bowl.
const CAP_BRIM = `
  M 70 264
  C 72 288, 120 300, 180 300
  C 240 300, 288 288, 290 264
  C 262 254, 98 254, 70 264
  Z
`

/* --- assembly ------------------------------------------------------------- */

export type GarmentShape = {
  /**
   * Parts that belong behind the torso — a hood, for instance. Painted in the
   * accent colour before the body, so the body crops them.
   */
  behind?: string[]
  /** Painted with the body colour. */
  body: string
  /** Painted with the accent colour — sleeves, side panels, hood lining. */
  accent: string[]
  /** Stroked with the trim colour: collar, cuffs, hem bands. */
  trim: string[]
  /** Seam hairlines, drawn in a translucent shade of the body colour. */
  seams: string[]
  /** Extra body-coloured parts drawn over the accents (pockets, brims). */
  overlay?: string[]
  /** Where the contact shadow sits. Defaults suit a full-length garment. */
  ground?: { y: number; rx: number }
}

function mirror(path: string) {
  // Reflect every x coordinate about the centre line. The path strings here
  // only contain M/L/C/Z with plain numbers, so a token walk is enough.
  return path.replace(/-?\d+(\.\d+)?/g, (() => {
    let isX = true
    return (match: string) => {
      const n = parseFloat(match)
      const out = isX ? CANVAS.cx * 2 - n : n
      isX = !isX
      return String(+out.toFixed(2))
    }
  })())
}

/** Collar band path for a given neckline, stroked rather than filled. */
const COLLAR = {
  crew: 'M 148 66 C 158 97, 202 97, 212 66',
  v: 'M 150 67 L 180 112 L 210 67',
  back: 'M 150 68 C 160 84, 200 84, 210 68',
  tank: 'M 156 70 C 164 100, 196 100, 204 70',
}

const HEM = 'M 97 396 L 263 396'
const CUFF_SHORT = 'M 33 158 L 92 187'
const CUFF_LONG = 'M 18 262 L 64 276'

export function shapeFor(type: GarmentType, view: View): GarmentShape {
  const back = view === 'back'

  switch (type) {
    case 'jersey':
      return {
        body: back ? TORSO_BACK : TORSO_V,
        accent: [SLEEVE_SHORT, mirror(SLEEVE_SHORT)],
        trim: [back ? COLLAR.back : COLLAR.v, CUFF_SHORT, mirror(CUFF_SHORT), HEM],
        seams: ['M 107 146 L 112 396', 'M 253 146 L 248 396'],
      }

    case 'tee':
      return {
        body: back ? TORSO_BACK : TORSO_CREW,
        accent: [SLEEVE_SHORT, mirror(SLEEVE_SHORT)],
        trim: [back ? COLLAR.back : COLLAR.crew, CUFF_SHORT, mirror(CUFF_SHORT)],
        seams: ['M 107 146 L 112 396', 'M 253 146 L 248 396'],
      }

    case 'longsleeve':
      return {
        body: back ? TORSO_BACK : TORSO_CREW,
        accent: [SLEEVE_LONG, mirror(SLEEVE_LONG)],
        trim: [back ? COLLAR.back : COLLAR.crew, CUFF_LONG, mirror(CUFF_LONG), HEM],
        seams: ['M 107 146 L 112 396', 'M 253 146 L 248 396'],
      }

    case 'tank':
      return {
        body: TORSO_TANK,
        accent: [],
        trim: [
          back ? COLLAR.back : COLLAR.tank,
          'M 128 78 C 112 104, 102 150, 100 200',
          'M 232 78 C 248 104, 258 150, 260 200',
          HEM,
        ],
        seams: [],
      }

    case 'hoodie':
      return {
        behind: [HOOD],
        body: back ? TORSO_BACK : TORSO_CREW,
        accent: [SLEEVE_LONG, mirror(SLEEVE_LONG)],
        // The collar band is what stops the hood reading as a head — it cuts
        // the hood off from the body at the neckline.
        trim: [back ? COLLAR.back : COLLAR.crew, CUFF_LONG, mirror(CUFF_LONG), HEM],
        seams: [
          'M 107 146 L 112 396',
          'M 253 146 L 248 396',
          // Drawstrings hang down the front only.
          ...(back ? [] : DRAWSTRINGS),
        ],
        overlay: back ? [] : [POCKET],
      }

    case 'jacket':
      return {
        body: back ? TORSO_BACK : TORSO_CREW,
        accent: [SLEEVE_LONG, mirror(SLEEVE_LONG)],
        trim: [back ? COLLAR.back : COLLAR.crew, CUFF_LONG, mirror(CUFF_LONG), HEM],
        // The centre zip reads as a seam, not a trim band.
        seams: back ? [] : ['M 180 92 L 180 396'],
      }

    case 'shorts':
      return {
        body: SHORTS,
        accent: [],
        trim: ['M 96 96 L 264 96', 'M 114 356 L 168 356', 'M 192 356 L 246 356'],
        seams: ['M 180 100 L 180 206'],
      }

    case 'tights':
      return {
        body: TIGHTS,
        accent: [],
        trim: ['M 100 74 L 260 74', 'M 122 414 L 168 414', 'M 192 414 L 238 414'],
        seams: ['M 180 78 L 180 208'],
      }

    case 'cap':
      return {
        body: CAP_CROWN,
        accent: [CAP_BRIM],
        // Sweatband seam where the crown meets the brim.
        trim: ['M 98 256 C 136 248, 224 248, 262 256'],
        seams: [
          'M 180 152 L 180 258',
          // The panel seams either side of centre.
          'M 124 208 C 146 188, 214 188, 236 208',
        ],
        // A cap sits far higher on the canvas than a garment, so the ground
        // contact has to come up with it or the cap floats.
        ground: { y: 322, rx: 78 },
      }
  }
}

/* --- print zones ---------------------------------------------------------- */

export type PrintBox = { x: number; y: number; w: number; h: number }

/**
 * Where each placement physically sits on the canvas. The studio positions
 * artwork in normalised coordinates inside these boxes, which is what keeps a
 * logo in the same spot on the garment across sizes.
 */
export const PRINT_BOXES: Record<string, PrintBox> = {
  front: { x: 134, y: 150, w: 92, h: 92 },
  back: { x: 112, y: 128, w: 136, h: 190 },
  'left-sleeve': { x: 44, y: 112, w: 46, h: 46 },
  'right-sleeve': { x: 270, y: 112, w: 46, h: 46 },
  'back-neck': { x: 152, y: 96, w: 56, h: 22 },
}

/** Chest wordmark baseline, and the back name/number anchors. */
export const TEXT_ANCHORS = {
  teamName: { x: 180, y: 178, maxWidth: 124 },
  playerName: { x: 180, y: 150, maxWidth: 128 },
  number: { x: 180, y: 268 },
}

/** Which placements show on which view, so the preview flips correctly. */
export const PLACEMENT_VIEW: Record<string, View> = {
  front: 'front',
  back: 'back',
  'left-sleeve': 'front',
  'right-sleeve': 'front',
  'back-neck': 'back',
}
