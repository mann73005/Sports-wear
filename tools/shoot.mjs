/* Screenshot harness.
   Drives the installed Chrome against a running dev/preview server so each
   surface can be eyeballed at a real viewport, and reports any console or
   page errors it picked up along the way.

   usage: node tools/shoot.mjs [outDir] [--mobile]
*/
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME =
  process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.URL || 'http://localhost:3000'
const MOBILE = process.argv.includes('--mobile')
const OUT = process.argv[2]?.startsWith('--') ? 'shots' : process.argv[2] || 'shots'

mkdirSync(OUT, { recursive: true })

const SHOTS = [
  { name: '01-home-hero', path: '/' },
  { name: '02-home-process', path: '/', y: 1500 },
  { name: '03-home-methods', path: '/', y: 3100 },
  { name: '04-home-team', path: '/', y: 4600 },
  { name: '05-shop', path: '/shop' },
  { name: '06-pdp', path: '/product/meridian-match-jersey' },
  { name: '07-pdp-detail', path: '/product/meridian-match-jersey', y: 900 },
  { name: '08-studio', path: '/customize/meridian-match-jersey' },
  { name: '09-cart', path: '/cart' },
  { name: '10-checkout', path: '/checkout' },
  { name: '11-track', path: '/orders/track' },
  // The order page requires the email the order was placed with.
  {
    name: '12-order',
    path: '/orders/ATH-DEMO-KIT1?email=coach%40northgaterovers.example',
  },
  { name: '13-admin', path: '/admin' },
  { name: '14-admin-order', path: '/admin/orders/ATH-DEMO-KIT1' },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
})

const page = await browser.newPage()
await page.setViewport(
  MOBILE
    ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { width: 1512, height: 950, deviceScaleFactor: 1 },
)

const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`[console] ${m.text()}`)
})
page.on('requestfailed', (r) => problems.push(`[request] ${r.url()} ${r.failure()?.errorText}`))

for (const shot of SHOTS) {
  try {
    await page.goto(BASE + shot.path, { waitUntil: 'networkidle0', timeout: 45000 })
    if (shot.y) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), shot.y)
      // Let scroll-linked transforms and in-view animations settle.
      await new Promise((r) => setTimeout(r, 900))
    } else {
      await new Promise((r) => setTimeout(r, 700))
    }
    await page.screenshot({ path: `${OUT}/${shot.name}.png` })
    console.log('  ok  ', shot.name)
  } catch (e) {
    console.log('  FAIL', shot.name, '-', e.message)
    problems.push(`[shot:${shot.name}] ${e.message}`)
  }
}

// Horizontal overflow is the classic failure on a page with full-bleed rows.
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
const overflow = await page.evaluate(() => {
  const w = document.documentElement.clientWidth
  return [...document.querySelectorAll('*')]
    .filter((el) => el.getBoundingClientRect().right > w + 2)
    .slice(0, 8)
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`)
})

await browser.close()

if (overflow.length) {
  console.log('\nHorizontal overflow:')
  overflow.forEach((o) => console.log('  ', o))
}
if (problems.length) {
  console.log('\nProblems:')
  ;[...new Set(problems)].forEach((p) => console.log('  ', p))
  process.exitCode = 1
} else {
  console.log('\nNo console or network errors.')
}
