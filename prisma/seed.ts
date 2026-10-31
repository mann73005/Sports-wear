import { PrismaClient } from '@prisma/client'
import { generateOrderNumber } from '../src/lib/utils'

const db = new PrismaClient()

/* ===========================================================================
   ATHLON catalogue.

   Every garment carries real construction detail — fabric, weight, fit,
   features. Research is unambiguous on this: at a premium price point the
   technical story is what dismantles the objection, and vague marketing copy
   is what loses the sale.
   =========================================================================== */

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const LEG_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ONE_SIZE = ['OS']

/** Stock levels with a couple of deliberate holes so the PDP has to cope. */
function stock(sizes: string[], holes: string[] = []) {
  return JSON.stringify(
    Object.fromEntries(
      sizes.map((s) => [s, holes.includes(s) ? 0 : 4 + Math.floor(Math.random() * 40)]),
    ),
  )
}

type Seed = {
  slug: string
  name: string
  blurb: string
  description: string
  category: string
  sport: string
  gender: string
  basePrice: number
  sku: string
  fabric: string
  weightGsm: number
  fit: string
  features: string[]
  careNotes: string
  printZones?: string[]
  customizable?: boolean
  badge?: string
  rating: number
  reviews: number
  featured?: boolean
  sizes?: string[]
  variants: {
    colorName: string
    bodyHex: string
    accentHex: string
    trimHex: string
    holes?: string[]
  }[]
}

const PRODUCTS: Seed[] = [
  /* --- football ---------------------------------------------------------- */
  {
    slug: 'meridian-match-jersey',
    name: 'Meridian Match Jersey',
    blurb: 'Competition-weight football jersey, built for 90 minutes.',
    description:
      'The jersey we build league kit on. A 145 gsm recycled polyester double-knit holds its shape through a full season of washes, while laser-cut ventilation under the arms and down the spine moves air where it actually gets hot. Raglan-free set-in sleeves keep the sponsor and number panels square, which matters when the whole squad is photographed in a line. Sublimation-ready: the fabric takes dye straight into the fibre, so there is no hand-feel on the print and nothing to crack after sixty washes.',
    category: 'jersey',
    sport: 'football',
    gender: 'unisex',
    basePrice: 7200,
    sku: 'ATH-MJ-145',
    fabric: '100% recycled polyester double-knit',
    weightGsm: 145,
    fit: 'athletic',
    features: [
      'Laser-cut underarm and spine ventilation',
      'Bonded hem — no stitch line under the shorts',
      'Set-in sleeve keeps number panels square',
      'Sublimation-ready, zero hand-feel print',
      'Holds shape through 60+ industrial washes',
    ],
    careNotes: 'Wash cold inside out. No fabric softener — it blocks the wicking finish.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve'],
    badge: 'bestseller',
    rating: 4.8,
    reviews: 412,
    featured: true,
    variants: [
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#0e4234', trimHex: '#f4f2ed' },
      { colorName: 'Chalk', bodyHex: '#f1efe8', accentHex: '#15181a', trimHex: '#15181a' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#e8e5dc' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#15181a', trimHex: '#f4f2ed', holes: ['XS'] },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#14307e', trimHex: '#f4f2ed' },
    ],
  },
  {
    slug: 'meridian-match-short',
    name: 'Meridian Match Short',
    blurb: 'The short that goes with the kit. Seven-inch, no liner.',
    description:
      'Cut to pair with the Meridian jersey and made from the same recycled double-knit so a full kit photographs as one piece. A seven-inch inseam clears the knee under load, the waistband is a flat bonded band rather than a drawcord channel — nothing to dig in during a slide — and a hidden key loop sits inside the right hip.',
    category: 'shorts',
    sport: 'football',
    gender: 'unisex',
    basePrice: 4800,
    sku: 'ATH-MS-145',
    fabric: '100% recycled polyester double-knit',
    weightGsm: 145,
    fit: 'athletic',
    features: ['7" inseam', 'Flat bonded waistband', 'Hidden interior key loop', 'Sublimation-ready'],
    careNotes: 'Wash cold inside out. Hang dry.',
    printZones: ['front', 'back'],
    rating: 4.6,
    reviews: 188,
    variants: [
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#15181a', trimHex: '#f4f2ed' },
      { colorName: 'Chalk', bodyHex: '#f1efe8', accentHex: '#f1efe8', trimHex: '#15181a' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#e8e5dc' },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#1b3fa8', trimHex: '#f4f2ed' },
    ],
  },

  /* --- basketball -------------------------------------------------------- */
  {
    slug: 'rebound-game-tank',
    name: 'Rebound Game Tank',
    blurb: 'Reversible basketball tank with a drop-needle rib body.',
    description:
      'A proper game tank: deep scooped armholes that do not bind at the top of a shot, a drop-needle rib body that stretches across the shoulders and recovers, and a reversible build so a squad only carries one set. The binding is a single continuous tape around neck and arms — no join to chafe. Numbers can be printed on both faces at the same time.',
    category: 'tank',
    sport: 'basketball',
    gender: 'unisex',
    basePrice: 6400,
    sku: 'ATH-RT-160',
    fabric: 'Drop-needle rib, 92% recycled polyester / 8% elastane',
    weightGsm: 160,
    fit: 'athletic',
    features: [
      'Fully reversible — two kits in one',
      'Continuous bound neck and armhole, no join',
      'Drop-needle rib stretches and recovers',
      'Numbers printable on both faces',
    ],
    careNotes: 'Wash cold. Do not iron the printed panels.',
    printZones: ['front', 'back'],
    badge: 'pro',
    rating: 4.7,
    reviews: 143,
    featured: true,
    variants: [
      { colorName: 'Carbon / Chalk', bodyHex: '#15181a', accentHex: '#15181a', trimHex: '#f1efe8' },
      { colorName: 'Signal / Carbon', bodyHex: '#e8552f', accentHex: '#e8552f', trimHex: '#15181a' },
      { colorName: 'Royal / Chalk', bodyHex: '#1b3fa8', accentHex: '#1b3fa8', trimHex: '#f1efe8' },
      { colorName: 'Field / Chalk', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#f1efe8' },
    ],
  },

  /* --- running ----------------------------------------------------------- */
  {
    slug: 'split-second-race-tee',
    name: 'Split Second Race Tee',
    blurb: 'A 78 gsm race tee you stop noticing after the first kilometre.',
    description:
      'Everything that is not making you faster has been removed. The body is a 78 gsm open-gauge knit that weighs less than a sheet of paper over the chest and dries in minutes; seams are bonded rather than stitched, so there is nothing at the shoulder for a race number or a pack strap to rub against. Reflective ink on the back yoke picks up headlights from roughly 120 metres.',
    category: 'tee',
    sport: 'running',
    gender: 'unisex',
    basePrice: 5800,
    sku: 'ATH-ST-078',
    fabric: 'Open-gauge recycled polyester, 78 gsm',
    weightGsm: 78,
    fit: 'athletic',
    features: [
      'Bonded seams — nothing to rub under a race number',
      'Dries in minutes',
      'Reflective back yoke, visible from ~120m',
      'Weighs 74g in a medium',
    ],
    careNotes: 'Wash cold, hang dry. Heat will close the knit and cost you the breathability.',
    printZones: ['front', 'back', 'left-sleeve'],
    badge: 'new',
    rating: 4.9,
    reviews: 256,
    featured: true,
    variants: [
      { colorName: 'Chalk', bodyHex: '#f4f2ed', accentHex: '#f4f2ed', trimHex: '#d9dbd6' },
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#15181a', trimHex: '#2b2f32' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#e8552f', trimHex: '#c43c18' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#5b6367', trimHex: '#45494d' },
    ],
  },
  {
    slug: 'split-second-half-tight',
    name: 'Split Second Half Tight',
    blurb: 'Eight-inch compression half tight with a real pocket system.',
    description:
      'Graduated compression through the quad and hamstring with a lighter panel behind the knee so the leg still bends freely. Three pockets that hold under load: two mesh thigh drops sized for gels, and a zipped rear pocket that takes a phone without it slapping. The waistband is 60 mm wide and bonded — it does not roll on a long effort.',
    category: 'tights',
    sport: 'running',
    gender: 'unisex',
    basePrice: 8800,
    sku: 'ATH-SH-220',
    fabric: 'Recycled nylon / elastane power knit, 220 gsm',
    weightGsm: 220,
    fit: 'compression',
    features: [
      'Graduated compression, lighter behind the knee',
      '60 mm bonded waistband that will not roll',
      'Two gel drops plus a zipped phone pocket',
      'Flatlock seams throughout',
    ],
    careNotes: 'Wash cold with like fabrics. Never tumble dry — heat kills elastane.',
    printZones: ['front', 'back'],
    rating: 4.7,
    reviews: 301,
    variants: [
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#15181a', trimHex: '#2b2f32' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#0b3326' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#5b6367', trimHex: '#45494d', holes: ['XXL'] },
    ],
  },
  {
    slug: 'nocturne-long-sleeve',
    name: 'Nocturne Long Sleeve',
    blurb: 'Winter-weight running long sleeve with thumbholes and full reflectivity.',
    description:
      'A brushed-back grid fleece that traps air without bulk, so it works from about 2°C to 12°C. The whole sleeve is printed with a reflective grid rather than a token strip, which means you are visible from the side — statistically where it matters. Bonded thumbholes stop the cuff riding up under a jacket.',
    category: 'longsleeve',
    sport: 'running',
    gender: 'unisex',
    basePrice: 9200,
    sku: 'ATH-NL-190',
    fabric: 'Brushed-back grid fleece, recycled polyester',
    weightGsm: 190,
    fit: 'athletic',
    features: [
      'Full-sleeve reflective grid, not a token strip',
      'Bonded thumbholes',
      'Comfortable roughly 2-12°C',
      'Offset shoulder seams clear a pack strap',
    ],
    careNotes: 'Wash cold inside out. Do not iron the reflective grid.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve'],
    rating: 4.8,
    reviews: 97,
    variants: [
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#1b1f21', trimHex: '#45494d' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#177055' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#c43c18', trimHex: '#15181a' },
    ],
  },

  /* --- training ---------------------------------------------------------- */
  {
    slug: 'anchor-training-hoodie',
    name: 'Anchor Training Hoodie',
    blurb: '420 gsm loopback hoodie. Heavy, square, built to outlast the gym.',
    description:
      'A proper heavyweight: 420 gsm loopback cotton, garment-dyed so the colour settles rather than sitting on the surface, with a boxy cut that holds its shape instead of collapsing at the shoulder. Twin-needle construction everywhere, a double-layer hood that stands up on its own, and ribbed cuffs that have not given up after two years of testing. This is the piece most teams put their crest on.',
    category: 'hoodie',
    sport: 'training',
    gender: 'unisex',
    basePrice: 11800,
    sku: 'ATH-AH-420',
    fabric: '420 gsm garment-dyed loopback cotton',
    weightGsm: 420,
    fit: 'relaxed',
    features: [
      'Garment-dyed — colour settles into the fibre',
      'Double-layer hood that stands on its own',
      'Twin-needle throughout',
      'Boxy cut that holds its shoulder line',
      'Takes embroidery beautifully',
    ],
    careNotes: 'Wash cold inside out. Expect ~3% shrinkage on the first wash; it is cut for it.',
    printZones: ['front', 'back', 'left-sleeve', 'back-neck'],
    badge: 'bestseller',
    rating: 4.9,
    reviews: 688,
    featured: true,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#1b1f21', trimHex: '#2b2f32' },
      { colorName: 'Bone', bodyHex: '#e6e2d7', accentHex: '#e6e2d7', trimHex: '#cfcabd' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#0b3326' },
      { colorName: 'Clay', bodyHex: '#8a5a44', accentHex: '#8a5a44', trimHex: '#6f4634' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#5b6367', trimHex: '#45494d' },
    ],
  },
  {
    slug: 'anchor-heavy-tee',
    name: 'Anchor Heavy Tee',
    blurb: '240 gsm heavyweight tee with a collar that survives the season.',
    description:
      'The tee most of our club work goes on. 240 gsm ring-spun cotton, tubular body so there is no twist after washing, and a 2 cm ribbed collar reinforced with shoulder-to-shoulder taping — the first thing to fail on a cheap tee, and the thing we over-built. Takes screen print, DTF and embroidery equally well.',
    category: 'tee',
    sport: 'training',
    gender: 'unisex',
    basePrice: 4200,
    sku: 'ATH-AT-240',
    fabric: '240 gsm ring-spun combed cotton',
    weightGsm: 240,
    fit: 'regular',
    features: [
      'Tubular body — will not twist in the wash',
      'Shoulder-to-shoulder taping',
      'Reinforced 2 cm ribbed collar',
      'Takes screen, DTF and embroidery',
    ],
    careNotes: 'Wash cold. Tumble low.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve', 'back-neck'],
    rating: 4.7,
    reviews: 921,
    featured: true,
    variants: [
      { colorName: 'Chalk', bodyHex: '#f4f2ed', accentHex: '#f4f2ed', trimHex: '#d9dbd6' },
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#1b1f21', trimHex: '#2b2f32' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#0b3326' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#e8552f', trimHex: '#c43c18' },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#1b3fa8', trimHex: '#14307e' },
      { colorName: 'Clay', bodyHex: '#8a5a44', accentHex: '#8a5a44', trimHex: '#6f4634' },
    ],
  },
  {
    slug: 'anchor-training-short',
    name: 'Anchor Training Short',
    blurb: 'Nine-inch woven training short with a four-way stretch gusset.',
    description:
      'A woven short for lifting and field work. Four-way stretch ripstop with a diamond gusset so a deep squat does not pull at the seat, a 9" inseam, and zipped hand pockets that keep a phone where you left it. The waistband takes an internal drawcord that cannot be pulled out in the wash.',
    category: 'shorts',
    sport: 'training',
    gender: 'unisex',
    basePrice: 6800,
    sku: 'ATH-AS-180',
    fabric: 'Four-way stretch recycled ripstop',
    weightGsm: 180,
    fit: 'regular',
    features: ['Diamond gusset for deep squats', '9" inseam', 'Zipped hand pockets', 'Captive drawcord'],
    careNotes: 'Wash cold, hang dry.',
    printZones: ['front', 'back'],
    rating: 4.5,
    reviews: 214,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#1b1f21', trimHex: '#2b2f32' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#5b6367', trimHex: '#45494d' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#0b3326' },
    ],
  },

  /* --- cycling ----------------------------------------------------------- */
  {
    slug: 'draft-aero-jersey',
    name: 'Draft Aero Jersey',
    blurb: 'Race-cut cycling jersey with a textured aero sleeve.',
    description:
      'Cut low at the front and long at the back for a position on the drops, with a dimpled aero fabric on the upper sleeve that trips the boundary layer — worth a measurable handful of watts at 45 km/h. Three rear pockets plus a zipped valuables drop, a full-length camlock zip that stays put on rough road, and a silicone gripper hem that does not ride up out of the saddle.',
    category: 'jersey',
    sport: 'cycling',
    gender: 'unisex',
    basePrice: 13500,
    sku: 'ATH-DJ-135',
    fabric: 'Dimpled aero knit with mesh side panels',
    weightGsm: 135,
    fit: 'compression',
    features: [
      'Dimpled aero sleeve fabric',
      'Three rear pockets plus a zipped drop',
      'Full-length camlock zip',
      'Silicone gripper hem',
      'Race cut — size up for a relaxed fit',
    ],
    careNotes: 'Zip closed before washing. Cold wash, hang dry.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve'],
    badge: 'pro',
    rating: 4.6,
    reviews: 134,
    variants: [
      { colorName: 'Carbon', bodyHex: '#15181a', accentHex: '#2b2f32', trimHex: '#e8552f' },
      { colorName: 'Chalk', bodyHex: '#f1efe8', accentHex: '#d9dbd6', trimHex: '#15181a' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#125443', trimHex: '#f1efe8' },
    ],
  },
  {
    slug: 'draft-wind-shell',
    name: 'Draft Wind Shell',
    blurb: '58 gram packable shell that lives in a jersey pocket.',
    description:
      'A shell with one job: take the chill off a descent and then disappear. 58 grams, packs into its own rear pocket to roughly the size of a pair of socks, and blocks wind almost completely while still venting through a laser-perforated back panel. Not waterproof, and deliberately so — a waterproof this light would cook you on the first climb.',
    category: 'jacket',
    sport: 'cycling',
    gender: 'unisex',
    basePrice: 10500,
    sku: 'ATH-DW-040',
    fabric: '7-denier ripstop with a DWR finish',
    weightGsm: 40,
    fit: 'athletic',
    features: [
      '58 g in a medium',
      'Packs into its own rear pocket',
      'Laser-perforated vented back',
      'Wind-blocking, water-repellent — not waterproof',
    ],
    careNotes: 'Cold wash, no softener. Reproof the DWR once a season.',
    printZones: ['front', 'back'],
    rating: 4.4,
    reviews: 76,
    variants: [
      { colorName: 'Chalk', bodyHex: '#eceae4', accentHex: '#d9dbd6', trimHex: '#15181a' },
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#2b2f32', trimHex: '#8e9497' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#c43c18', trimHex: '#15181a' },
    ],
  },

  /* --- multi ------------------------------------------------------------- */
  {
    slug: 'base-camp-jacket',
    name: 'Base Camp Jacket',
    blurb: 'Full-zip touchline jacket. Warm, quiet, properly waterproof.',
    description:
      'What the coaching staff actually wear in February. A 10k/10k membrane with fully taped seams, a two-way front zip so it still works sitting down, and a soft brushed lining at the chin so the collar can be zipped right up without it being unpleasant. Deep handwarmer pockets, an articulated elbow, and a hem drawcord that seals out a crosswind.',
    category: 'jacket',
    sport: 'multi',
    gender: 'unisex',
    basePrice: 16500,
    sku: 'ATH-BC-310',
    fabric: '10k/10k membrane, fully taped seams',
    weightGsm: 310,
    fit: 'regular',
    features: [
      '10,000 mm waterproof / 10,000 g breathable',
      'Fully taped seams',
      'Two-way front zip',
      'Brushed chin guard',
      'Articulated elbow, hem drawcord',
    ],
    careNotes: 'Wash cold on a technical cycle. Tumble low to reactivate the DWR.',
    printZones: ['front', 'back', 'left-sleeve'],
    rating: 4.8,
    reviews: 159,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#15181a', trimHex: '#45494d' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#177055' },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#14307e', trimHex: '#f1efe8' },
    ],
  },
  {
    slug: 'club-six-panel-cap',
    name: 'Club Six-Panel Cap',
    blurb: 'Unstructured six-panel. The cheapest way to put a crest on a squad.',
    description:
      'An unstructured, garment-washed six-panel that sits low and does not look like a giveaway. Cotton twill crown, brass slider at the back, and a pre-curved brim that arrives already broken in. Embroidery on the front panel is included in the configurator and is where this product earns its keep for clubs.',
    category: 'cap',
    sport: 'multi',
    gender: 'unisex',
    basePrice: 3200,
    sku: 'ATH-CC-OS',
    fabric: 'Garment-washed cotton twill',
    weightGsm: 260,
    fit: 'regular',
    features: ['Unstructured low crown', 'Brass slider', 'Pre-curved brim', 'Front-panel embroidery'],
    careNotes: 'Spot clean. Never put a cap through a machine.',
    printZones: ['front'],
    sizes: ONE_SIZE,
    rating: 4.5,
    reviews: 342,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#15181a', trimHex: '#2b2f32' },
      { colorName: 'Bone', bodyHex: '#e6e2d7', accentHex: '#d9d4c6', trimHex: '#cfcabd' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#125443' },
      { colorName: 'Signal', bodyHex: '#e8552f', accentHex: '#c43c18', trimHex: '#15181a' },
    ],
  },
  {
    slug: 'academy-training-top',
    name: 'Academy Training Top',
    blurb: 'Quarter-zip midlayer for cold sessions on grass.',
    description:
      'A brushed-back midlayer for the part of the session before anyone is warm. The quarter zip opens to dump heat fast, the cuffs are long enough to cover the wrist in a plank, and the body is cut long at the back so it stays down when you bend. Our most-ordered club piece after the heavy tee.',
    category: 'longsleeve',
    sport: 'training',
    gender: 'unisex',
    basePrice: 7800,
    sku: 'ATH-AC-240',
    fabric: 'Brushed-back recycled poly knit',
    weightGsm: 240,
    fit: 'athletic',
    features: ['Quarter zip for fast heat dump', 'Dropped back hem', 'Long cuffs', 'Chin guard'],
    careNotes: 'Wash cold inside out.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve'],
    rating: 4.6,
    reviews: 275,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#15181a', trimHex: '#2b2f32' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#177055' },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#14307e', trimHex: '#f1efe8' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#45494d', trimHex: '#8e9497' },
    ],
  },
  {
    slug: 'studio-seamless-tank',
    name: 'Studio Seamless Tank',
    blurb: 'Knitted in one piece. No side seams, nothing to rub.',
    description:
      'Knitted as a single tube on a circular machine, so there are no side seams at all — the density of the knit changes instead, open across the back and ribbed through the waist. It is the most comfortable thing we make, and the reason it is not customisable everywhere is that a seamless body only takes print across the front panel.',
    category: 'tank',
    sport: 'training',
    gender: 'women',
    basePrice: 5600,
    sku: 'ATH-SS-170',
    fabric: 'Seamless recycled nylon / elastane',
    weightGsm: 170,
    fit: 'compression',
    features: ['Knitted in one piece — zero side seams', 'Zoned open knit across the back', 'Ribbed waist'],
    careNotes: 'Wash cold in a bag. Hang dry.',
    printZones: ['front'],
    badge: 'new',
    rating: 4.8,
    reviews: 188,
    variants: [
      { colorName: 'Bone', bodyHex: '#e6e2d7', accentHex: '#e6e2d7', trimHex: '#cfcabd' },
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#1b1f21', trimHex: '#2b2f32' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#125443' },
      { colorName: 'Clay', bodyHex: '#8a5a44', accentHex: '#8a5a44', trimHex: '#6f4634' },
    ],
  },
  {
    slug: 'studio-seamless-legging',
    name: 'Studio Seamless Legging',
    blurb: 'High-waisted seamless legging, squat-proof at every size.',
    description:
      'The same one-piece knit as the tank, taken to a high waist. The seat is knitted at double density, which is what makes it opaque under load — we test every colourway on a bench squat under studio lighting before it ships, because a legging that fails that test is not a legging. A hidden waistband pocket takes a card and a key.',
    category: 'tights',
    sport: 'training',
    gender: 'women',
    basePrice: 8400,
    sku: 'ATH-SL-230',
    fabric: 'Seamless recycled nylon / elastane',
    weightGsm: 230,
    fit: 'compression',
    features: [
      'Double-density seat — squat tested per colourway',
      'High waist, no roll',
      'Hidden waistband pocket',
      'Zero side seams',
    ],
    careNotes: 'Wash cold in a bag. Never tumble dry.',
    printZones: ['front', 'back'],
    badge: 'bestseller',
    rating: 4.9,
    reviews: 744,
    featured: true,
    variants: [
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#1b1f21', trimHex: '#2b2f32' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0e4234', trimHex: '#125443' },
      { colorName: 'Clay', bodyHex: '#8a5a44', accentHex: '#8a5a44', trimHex: '#6f4634' },
      { colorName: 'Slate', bodyHex: '#5b6367', accentHex: '#5b6367', trimHex: '#45494d' },
    ],
  },
  {
    slug: 'terrace-club-jersey',
    name: 'Terrace Club Jersey',
    blurb: 'Relaxed-fit retro football jersey, cut for the stand not the pitch.',
    description:
      'A boxier, heavier take on a match jersey for people who are watching rather than playing. 190 gsm interlock with a soft hand, a ribbed V-collar, and a straight hem that sits well untucked. It is the piece that supporters groups order, which is why the configurator opens it with the back panel ready for a name and a year rather than a squad number.',
    category: 'jersey',
    sport: 'football',
    gender: 'unisex',
    basePrice: 8600,
    sku: 'ATH-TC-190',
    fabric: '190 gsm poly-cotton interlock',
    weightGsm: 190,
    fit: 'relaxed',
    features: ['Boxy retro cut', 'Ribbed V-collar', 'Straight hem for untucked wear', 'Soft hand interlock'],
    careNotes: 'Wash cold inside out. Tumble low.',
    printZones: ['front', 'back', 'left-sleeve', 'right-sleeve', 'back-neck'],
    rating: 4.7,
    reviews: 203,
    variants: [
      { colorName: 'Bone', bodyHex: '#e6e2d7', accentHex: '#d9d4c6', trimHex: '#0e4234' },
      { colorName: 'Field Green', bodyHex: '#0e4234', accentHex: '#0b3326', trimHex: '#e6e2d7' },
      { colorName: 'Royal', bodyHex: '#1b3fa8', accentHex: '#14307e', trimHex: '#e6e2d7' },
      { colorName: 'Carbon', bodyHex: '#1b1f21', accentHex: '#15181a', trimHex: '#e8552f' },
    ],
  },
]

async function main() {
  console.log('Resetting catalogue...')
  await db.orderEvent.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.variant.deleteMany()
  await db.product.deleteMany()

  for (const p of PRODUCTS) {
    const sizes = p.sizes ?? (['shorts', 'tights'].includes(p.category) ? LEG_SIZES : TOP_SIZES)

    await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        blurb: p.blurb,
        description: p.description,
        category: p.category,
        sport: p.sport,
        gender: p.gender,
        basePrice: p.basePrice,
        sku: p.sku,
        fabric: p.fabric,
        weightGsm: p.weightGsm,
        fit: p.fit,
        features: JSON.stringify(p.features),
        careNotes: p.careNotes,
        customizable: p.customizable ?? true,
        printZones: JSON.stringify(p.printZones ?? ['front', 'back']),
        badge: p.badge ?? null,
        rating: p.rating,
        reviews: p.reviews,
        featured: p.featured ?? false,
        variants: {
          create: p.variants.map((v) => ({
            colorName: v.colorName,
            bodyHex: v.bodyHex,
            accentHex: v.accentHex,
            trimHex: v.trimHex,
            stock: stock(sizes, v.holes ?? []),
          })),
        },
      },
    })
  }

  console.log(`Seeded ${PRODUCTS.length} products.`)

  /* --- a few demo orders so the tracker and admin have something to show -- */
  const jersey = await db.product.findUnique({
    where: { slug: 'meridian-match-jersey' },
    include: { variants: true },
  })
  const hoodie = await db.product.findUnique({
    where: { slug: 'anchor-training-hoodie' },
    include: { variants: true },
  })
  if (!jersey || !hoodie) return

  const demos = [
    {
      number: 'ATH-DEMO-KIT1',
      email: 'coach@northgaterovers.example',
      name: 'Dani Okonjo',
      status: 'printing',
      flow: ['received', 'artwork', 'printing'],
      shippingMethod: 'express',
      item: {
        product: jersey,
        variant: jersey.variants[2],
        quantity: 14,
        customization: {
          method: 'sublimation',
          bodyHex: '#0e4234',
          accentHex: '#0b3326',
          trimHex: '#e8e5dc',
          teamName: 'NORTHGATE',
          teamFont: 'block',
          numberStyle: 'solid',
          numberHex: '#e8e5dc',
          artwork: [],
          notes: 'Crest supplied separately by email — please match PMS 350.',
          roster: [
            { id: 'r1', playerName: 'OKONJO', number: '4', size: 'L', quantity: 1 },
            { id: 'r2', playerName: 'HARPER', number: '7', size: 'M', quantity: 1 },
            { id: 'r3', playerName: 'VASQUEZ', number: '9', size: 'L', quantity: 1 },
            { id: 'r4', playerName: 'ILIEV', number: '10', size: 'M', quantity: 1 },
            { id: 'r5', playerName: 'SQUAD', number: '', size: 'L', quantity: 10 },
          ],
        },
      },
    },
    {
      number: 'ATH-DEMO-HOOD',
      email: 'ops@benchpressclub.example',
      name: 'Marta Lindqvist',
      status: 'dispatched',
      flow: ['received', 'artwork', 'printing', 'stitching', 'qc', 'dispatched'],
      shippingMethod: 'standard',
      item: {
        product: hoodie,
        variant: hoodie.variants[0],
        quantity: 24,
        customization: {
          method: 'embroidery',
          bodyHex: '#1b1f21',
          accentHex: '#1b1f21',
          trimHex: '#2b2f32',
          teamName: 'BENCH PRESS',
          teamFont: 'condensed',
          numberStyle: 'solid',
          numberHex: '#f4f2ed',
          artwork: [],
          notes: '',
          roster: [],
        },
      },
    },
  ]

  for (const d of demos) {
    const { product, variant, quantity, customization } = d.item
    const unitPrice = product.basePrice
    // Mirrors lib/pricing for these fixtures; the live path imports it.
    const printCost = customization.method === 'embroidery' ? 1100 : 700
    const lineTotal = (unitPrice + printCost) * quantity

    const subtotal = lineTotal
    const shipping = d.shippingMethod === 'express' ? 1400 : 0
    const tax = Math.round(subtotal * 0.08)

    const order = await db.order.create({
      data: {
        number: d.number,
        email: d.email,
        name: d.name,
        phone: '+1 555 0100',
        addressLine1: '12 Vicarage Road',
        city: 'Leeds',
        region: 'West Yorkshire',
        postcode: 'LS1 4AP',
        country: 'United Kingdom',
        shippingMethod: d.shippingMethod,
        subtotal,
        printTotal: printCost * quantity,
        shipping,
        tax,
        total: subtotal + shipping + tax,
        status: d.status,
        items: {
          create: [
            {
              productId: product.id,
              productSlug: product.slug,
              name: product.name,
              sku: product.sku,
              category: product.category,
              size: 'mixed',
              colorName: variant.colorName,
              bodyHex: customization.bodyHex,
              accentHex: customization.accentHex,
              trimHex: customization.trimHex,
              quantity,
              unitPrice,
              printCost,
              lineTotal,
              customization: JSON.stringify(customization),
            },
          ],
        },
      },
    })

    // Backdate the timeline so the tracker shows a believable history.
    const start = Date.now() - d.flow.length * 26 * 3600 * 1000
    for (const [i, status] of d.flow.entries()) {
      await db.orderEvent.create({
        data: {
          orderId: order.id,
          status,
          createdAt: new Date(start + i * 26 * 3600 * 1000),
        },
      })
    }
  }

  console.log('Seeded 2 demo orders: ATH-DEMO-KIT1, ATH-DEMO-HOOD')
  console.log('Sample fresh reference:', generateOrderNumber())
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
