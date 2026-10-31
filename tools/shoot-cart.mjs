/* Seeds a cart in localStorage, then shoots the populated cart and checkout.
   Those two views are unreachable with an empty cart, so the main harness
   only ever captures their empty states.

   usage: node tools/shoot-cart.mjs
*/
import puppeteer from 'puppeteer-core'
import { PrismaClient } from '@prisma/client'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.URL || 'http://localhost:3000'

const db = new PrismaClient()
const jersey = await db.product.findUnique({ where: { slug: 'meridian-match-jersey' } })
const hoodie = await db.product.findUnique({ where: { slug: 'anchor-training-hoodie' } })
const tee = await db.product.findUnique({ where: { slug: 'anchor-heavy-tee' } })
await db.$disconnect()

const items = [
  {
    id: 'seed-1',
    productId: jersey.id,
    slug: jersey.slug,
    name: jersey.name,
    sku: jersey.sku,
    category: 'jersey',
    basePrice: jersey.basePrice,
    size: 'mixed',
    colorName: 'Custom',
    bodyHex: '#0e4234',
    accentHex: '#0b3326',
    trimHex: '#e8e5dc',
    quantity: 14,
    addedAt: Date.now(),
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
      notes: 'Crest to follow by email — match PMS 350.',
      roster: [
        { id: 'r1', playerName: 'OKONJO', number: '4', size: 'L', quantity: 1 },
        { id: 'r2', playerName: 'HARPER', number: '7', size: 'M', quantity: 1 },
        { id: 'r3', playerName: 'VASQUEZ', number: '9', size: 'L', quantity: 1 },
        { id: 'r4', playerName: 'ILIEV', number: '10', size: 'M', quantity: 1 },
        { id: 'r5', playerName: 'SQUAD', number: '', size: 'L', quantity: 10 },
      ],
    },
  },
  {
    id: 'seed-2',
    productId: hoodie.id,
    slug: hoodie.slug,
    name: hoodie.name,
    sku: hoodie.sku,
    category: 'hoodie',
    basePrice: hoodie.basePrice,
    size: 'L',
    colorName: 'Carbon',
    bodyHex: '#1b1f21',
    accentHex: '#1b1f21',
    trimHex: '#2b2f32',
    quantity: 6,
    addedAt: Date.now(),
    customization: {
      method: 'embroidery',
      bodyHex: '#1b1f21',
      accentHex: '#1b1f21',
      trimHex: '#2b2f32',
      teamName: 'NORTHGATE',
      teamFont: 'condensed',
      numberStyle: 'solid',
      numberHex: '#f4f2ed',
      artwork: [],
      notes: '',
      roster: [],
    },
  },
  {
    id: 'seed-3',
    productId: tee.id,
    slug: tee.slug,
    name: tee.name,
    sku: tee.sku,
    category: 'tee',
    basePrice: tee.basePrice,
    size: 'M',
    colorName: 'Chalk',
    bodyHex: '#f4f2ed',
    accentHex: '#f4f2ed',
    trimHex: '#d9dbd6',
    quantity: 2,
    addedAt: Date.now(),
    customization: null,
  },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1512, height: 950 })

const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[console] ${m.text()}`))

// The store has to exist in localStorage before the app boots, so seed it on
// a cheap page first and only then navigate to the cart.
await page.goto(BASE + '/shop', { waitUntil: 'domcontentloaded' })
await page.evaluate((items) => {
  localStorage.setItem('athlon-cart', JSON.stringify({ state: { items }, version: 0 }))
}, items)

for (const [name, path] of [
  ['20-cart-full', '/cart'],
  ['21-checkout-full', '/checkout'],
]) {
  await page.goto(BASE + path, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: `shots/${name}.png` })
  console.log('  ok  ', name)
}

// And the drawer, which is the path most people actually see.
await page.goto(BASE + '/shop', { waitUntil: 'networkidle0' })
await page.click('button[aria-label^="Open cart"]')
await new Promise((r) => setTimeout(r, 700))
await page.screenshot({ path: 'shots/22-cart-drawer.png' })
console.log('  ok   22-cart-drawer')

await browser.close()

if (problems.length) {
  console.log('\nProblems:')
  ;[...new Set(problems)].forEach((p) => console.log('  ', p))
  process.exitCode = 1
} else {
  console.log('\nNo console errors.')
}
