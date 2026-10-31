/* End-to-end smoke test through the real UI.

   Opens the studio, builds a kit (repaint, wordmark, roster), adds it to the
   cart, fills checkout, places the order, and confirms the resulting order
   page shows the spec that was designed. Shoots each step.

   usage: node tools/e2e.mjs
*/
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.URL || 'http://localhost:3000'

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

const step = (msg) => console.log('  ', msg)
const pause = (ms = 500) => new Promise((r) => setTimeout(r, ms))

// --- 1. build a kit in the studio ------------------------------------------
await page.goto(`${BASE}/customize/meridian-match-jersey`, { waitUntil: 'networkidle0' })
step('studio open')

// Repaint the body: click the Field Green swatch in the Body picker.
await page.click('button[aria-label="Field Green"]')
await pause(250)

// Chest wordmark.
await page.click('button[role="tab"]:nth-of-type(3)')
await pause(300)
await page.type('#teamName', 'NORTHGATE', { delay: 20 })
await pause(300)

// Roster: add three players.
await page.click('button[role="tab"]:nth-of-type(5)')
await pause(300)
await page.click('button ::-p-text(Add the first player)')
await pause(300)

const names = [
  ['OKONJO', '4'],
  ['HARPER', '7'],
  ['VASQUEZ', '9'],
]
for (const [i, [name, num]] of names.entries()) {
  if (i > 0) {
    await page.click('button ::-p-text(Add player)')
    await pause(250)
  }
  await page.type(`input[aria-label="Player ${i + 1} name"]`, name, { delay: 15 })
  await page.type(`input[aria-label="Player ${i + 1} number"]`, num, { delay: 15 })
  await page.evaluate((n) => {
    const q = document.querySelector(`input[aria-label="Player ${n} quantity"]`)
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(q, '4')
    q.dispatchEvent(new Event('input', { bubbles: true }))
  }, i + 1)
  await pause(200)
}
step('kit built: NORTHGATE, 3 players x4 = 12 garments')

await pause(700)
await page.screenshot({ path: 'shots/30-studio-roster.png' })

const studioTotal = await page.$eval('button ::-p-text(Add to cart)', (el) => el.textContent)
step(`studio total: ${studioTotal.replace('Add to cart · ', '')}`)

// --- 2. add to cart --------------------------------------------------------
await page.click('button ::-p-text(Add to cart)')
await pause(900)
await page.screenshot({ path: 'shots/31-added.png' })
step('added to cart')

// --- 3. checkout -----------------------------------------------------------
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' })
await pause(600)

const fields = {
  '#email': 'e2e@northgaterovers.example',
  '#name': 'Dani Okonjo',
  '#addressLine1': '12 Vicarage Road',
  '#city': 'Leeds',
  '#region': 'West Yorkshire',
  '#postcode': 'LS1 4AP',
}
for (const [sel, value] of Object.entries(fields)) {
  await page.type(sel, value, { delay: 5 })
}
await page.click('input[value="express"] + span, label:has(input[value="express"])')
await pause(400)
await page.screenshot({ path: 'shots/32-checkout-filled.png' })

const checkoutTotal = await page.$eval('button[type="submit"]', (el) => el.textContent)
step(`checkout total: ${checkoutTotal.replace('Place order · ', '')}`)

// --- 4. place it -----------------------------------------------------------
await page.click('button[type="submit"]')
await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 })
await pause(900)

const url = page.url()
if (!/\/orders\/ATH-/.test(url)) {
  problems.push(`[flow] expected an order page, landed on ${url}`)
} else {
  step(`order placed: ${url.split('/orders/')[1].split('?')[0]}`)
}
await page.screenshot({ path: 'shots/33-order-placed.png' })

// --- 5. the spec survived the round trip -----------------------------------
// Lowercased because innerText applies text-transform, and several of these
// land inside uppercase badges.
const body = (await page.evaluate(() => document.body.innerText)).toLowerCase()
for (const probe of [
  'northgate',
  'okonjo',
  'vasquez',
  'dye sublimation',
  'order received',
  '#0e4234',
]) {
  if (!body.includes(probe)) problems.push(`[spec] order page is missing "${probe}"`)
}
// The cart must be empty again, and only after the server confirmed.
const cartLeft = await page.evaluate(
  () => JSON.parse(localStorage.getItem('athlon-cart') || '{}')?.state?.items?.length ?? 0,
)
if (cartLeft !== 0) problems.push(`[flow] cart still holds ${cartLeft} line(s) after checkout`)
step(`spec round-trip verified · cart cleared (${cartLeft} lines)`)

await browser.close()

if (problems.length) {
  console.log('\nFAILURES:')
  ;[...new Set(problems)].forEach((p) => console.log('  ', p))
  process.exitCode = 1
} else {
  console.log('\nEnd-to-end flow passed.')
}
