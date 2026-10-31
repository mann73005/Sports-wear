# ATHLON

A sportswear storefront with a print-on-demand studio attached. Seventeen blanks, a live
customiser that previews what the press will actually produce, a checkout that writes a real
order, and a production console that moves that order from artwork to delivered.

Next.js 15 · React 19 · Tailwind v4 · Prisma/SQLite · Motion. **No photography** — every
garment on the site is vector artwork drawn in code, which is also what makes the customiser
possible.

```bash
npm install
npm run setup      # generate client, create db, seed catalogue + demo orders
npm run dev        # http://localhost:3000
```

`npm run db:reset` re-seeds from scratch. ATHLON is invented for this build; no real brand,
logo or trademark appears anywhere.

---

## What is here

| Route | What it does |
| --- | --- |
| `/` | Marketing. Hero reel, the three-step explainer, print methods, categories, volume pricing. |
| `/shop` | Catalogue. Faceted filters (category, discipline, cut, fit, price), five sorts, all URL-driven. |
| `/product/[slug]` | PDP. Front/back gallery, colourway + size pickers with real stock, size guide, construction detail. |
| `/studio` | The customiser explained — methods compared, artwork guidance, volume tiers, all 17 blanks. |
| `/customize/[slug]` | **The studio.** Repaint, print, name the squad, live price. |
| `/cart`, `/checkout` | Cart with per-line print specs; checkout writes the order. |
| `/orders/track` | Look an order up by reference + email. |
| `/orders/[number]` | Production timeline and the spec sheet for every line. |
| `/admin` | Production queue, filtered by stage. |
| `/admin/orders/[number]` | Work sheet, event log, and the control that advances the order. |

Two demo orders are seeded so the tracker and console have something to show:

```
ATH-DEMO-KIT1   coach@northgaterovers.example   (printing, 14-shirt roster)
ATH-DEMO-HOOD   ops@benchpressclub.example      (dispatched, 24 hoodies)
```

---

## The garment renderer

`src/art/` is the centre of the build. `garment-paths.ts` holds every outline on one
360 × 440 canvas; `Garment.tsx` paints it. One component draws every piece of kit on the
site — product cards, the PDP gallery, cart thumbnails, the live studio preview and the
spec sheet on the order — so a jersey is the same jersey everywhere.

It takes three paint slots (body, accent panels, trim) plus an optional print spec, and is
pure and deterministic: no hooks, no randomness, safe in server components.

Three details worth knowing:

- **Layer order is `behind → body → accent → print → shading → seams → trim`.** A hoodie's
  hood is in `behind` so the torso crops it — painted on top it reads as a head. Shading is
  applied *over* the print so ink picks up the garment's form rather than floating on it.
- **Everything printed is clipped to actual fabric**, so a logo can never drift off the edge
  of the garment.
- **Mirroring is a token walk.** `mirror()` reflects every x coordinate about the centre
  line, which works because every path uses only `M`/`L`/`C`/`Z` and therefore contains
  nothing but x,y pairs.

Print zones are normalised boxes (`PRINT_BOXES`), so artwork sits in the same place on the
garment regardless of render size.

---

## Pricing

`src/lib/pricing.ts` is the single implementation, run in two places:

- the studio, on every keystroke, to animate the running total
- the `POST /api/orders` route handler, to rebuild every line from scratch

**The server never trusts a price from the browser.** The checkout payload carries product
ids, sizes, quantities and the print spec — no money at all (`src/lib/order-schema.ts`).
One implementation shared by both means the two can't drift.

A line costs: garment × units, plus per-placement print, plus a one-off setup for methods
that burn a screen or digitise a design, plus per-shirt name/number surcharges on the roster
entries that actually carry them — then the volume break off the whole line.

Volume tiers: 6+ −5%, 12+ −10%, 25+ −15%, 50+ −22%.

---

## The print spec

`src/lib/customization.ts` defines the contract between three parties: the studio writes it,
the pricing engine costs it, the production floor reads it back off the order. It is stored
as JSON on `OrderItem`, so once an order exists the spec is frozen — later catalogue edits
cannot retroactively change what somebody bought.

Uploaded artwork is held as a data URL inside that spec rather than in a separate asset
store. It makes the whole thing one self-contained blob that survives a refresh in
localStorage and lands on the order intact, which is also why the size ceiling is low.

A roster defines its own garment count: when one is present, the sum of its entries *is* the
line quantity, and the quantity stepper is replaced by a count — otherwise the two could
silently contradict each other.

---

## Orders

The event log is the source of truth. `Order.status` is a denormalised cache of the newest
event so the queue view doesn't have to join on every row.

```
received → artwork → printing → stitching → qc → dispatched → delivered
```

`cancelled` sits off the flow. The console advances one step at a time plus an explicit
cancel — jumping straight from `received` to `dispatched` is almost always a misclick.

### Order lookup

There are no accounts, so the reference plus the email it was placed with is the credential.
Both are required, and **every failure returns the same 404** — wrong email, bogus reference,
or both. The email is checked *before* the database lookup: handled after it, an existing
reference would answer 400 while a bogus one answered 404, and that difference is an oracle
for enumerating valid references without knowing a single email address.

`SpecSheet` is deliberately the same component on the customer's order page and in the admin
console. What the customer approved and what the operator makes are read off one artefact, so
there is no gap for a misprint to fall through.

---

## Research the build follows

- **Reassurance on the PDP, not at checkout.** Baymard finds 44% of apparel sites fail to
  surface returns from the product page, and it is a top source of hesitation. Shipping,
  returns, warranty and made-to-order all sit above the fold.
- **Context-aware sizing.** The size guide varies by garment type (`src/lib/sizing.ts`) —
  a leggings chart quoting chest measurements is a leading cause of apparel returns.
- **Technical depth justifies the price.** Every product carries real fabric, gsm, cut and
  construction detail, in an accordion rather than a wall of text.
- **The preview is the product.** Live, per-shirt roster previews are what make a team order
  checkable before it is made.
- **Variant UX is the common weak point** even on beautiful sites — hence 40px colour hit
  areas, sold-out states that are struck through rather than hidden, and a size that clears
  itself when you switch to a colourway that doesn't stock it.

---

## Structure

```
prisma/schema.prisma      products, variants, orders, items, events
prisma/seed.ts            17 products + 2 demo orders
src/
  app/                    routes; api/orders is the only write path
  art/                    garment-paths.ts, Garment.tsx
  components/
    ui/                   button, badge, input, sheet, dialog, misc
    site/                 header, footer, cart drawer
    product/              card, detail, filters
    studio/               Studio, ColorPicker, RosterEditor, ArtworkEditor
    orders/               Timeline, SpecSheet
  lib/
    pricing.ts            one engine, client + server
    customization.ts      the print spec
    order-schema.ts       what the browser may send
    catalog.ts            server-only reads  (catalog.shared.ts for labels)
tools/shoot.mjs           screenshot harness, desktop + --mobile
tools/shoot-cart.mjs      seeds a cart, shoots cart/checkout/drawer
```

`catalog.ts` is `server-only` and parses SQLite's JSON-string columns once, so no page has
to remember to `JSON.parse` a feature list. Label maps live in `catalog.shared.ts` because
client components need them.

---

## Deploying

The app is wired to build and run on Vercel out of the box, **but read this first.**

### What works on Vercel today, and what does not

The build script creates and seeds the SQLite database, and `outputFileTracingIncludes`
ships that file into the serverless bundle. So every **read** path works:

| Works | Does not work |
| --- | --- |
| Marketing, `/shop`, all 17 PDPs | **Placing an order** (`POST /api/orders`) |
| The studio, live preview, live pricing | **Advancing an order** (`PATCH /api/orders/:number`) |
| Cart and checkout form (cart is localStorage) | |
| Order tracking + detail for the two seeded demo orders | |
| Admin queue and work sheets | |

The reason is simple: a Vercel serverless function's bundle is **read-only**, and the
database lives inside it. Reads are fine; the first write fails. Pressing "Place order"
will return a 500.

There is a second, subtler catch: each deployment ships its own copy of the seeded file, so
even if writes did land they would not survive a redeploy and would not be shared between
concurrent function instances.

### Making it fully work — move to Postgres

About fifteen minutes, and it is the only change needed:

1. **Create a database.** In the Vercel dashboard: *Storage → Create Database → Postgres*
   (free tier). It injects `DATABASE_URL` into the project automatically. Neon or Supabase
   work identically — just paste the connection string into *Settings → Environment
   Variables*.

2. **Switch the provider** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Make search case-insensitive.** SQLite's `contains` ignores case; Postgres's does not.
   In `src/lib/catalog.ts`, the four `contains` filters in `getProducts` need
   `mode: 'insensitive'` added, or shop search will start missing obvious matches.

4. **Drop the seeding out of the build.** Change `build` in `package.json` back to:
   ```
   "build": "prisma generate && next build"
   ```
   and remove `outputFileTracingIncludes` from `next.config.ts`. Then seed once, locally,
   pointed at the hosted database:
   ```bash
   DATABASE_URL="<your postgres url>" npx prisma db push
   DATABASE_URL="<your postgres url>" npx tsx prisma/seed.ts
   ```

5. Delete `vercel.json` — it only exists to pin the SQLite path.

After that, checkout writes real orders, the tracker reads them back, and the admin console
can move them through production.

### Before showing it to anyone outside the team

`/admin` and the `GET /api/orders` / `PATCH /api/orders/:number` handlers are **not
authenticated**. On a public URL, anyone who finds `/admin` can read every customer's name,
email and address, and cancel their orders. Put staff auth in front of the admin layout and
those two handlers first.

---

## Notes

- Full `prefers-reduced-motion` support; the hero stops cycling, scroll-linked transforms
  flatten, transitions collapse.
- The capability marquee is wider than the viewport on purpose — `html` is `overflow-x: clip`
  so it crops rather than scrolling the page sideways.
- Money is integer cents everywhere. It becomes a decimal only in `formatMoney`.
- Order references exclude ambiguous glyphs (`0`/`O`, `1`/`I`) so one read off a packing slip
  over the phone survives.
- `/admin` and the `GET /api/orders` and `PATCH /api/orders/:number` handlers are **not
  authenticated**. That is fine for a demo and is not fine for a deployment — staff auth
  belongs in front of the admin layout and those two handlers.
- No payment is taken. Checkout writes the order and nothing else.
```
