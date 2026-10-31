const CAPABILITIES = [
  'Dye sublimation',
  'Screen print',
  'Embroidery',
  'DTF transfer',
  'Cut & sew',
  'Name & number',
  'Roster management',
  'Print-ready artwork',
  'No minimum order',
  'Volume pricing',
]

/**
 * Infinite capability rail. The track holds two copies of the list and
 * translates exactly -50%, so the loop point is seamless.
 */
export function Marquee() {
  return (
    <div className="border-y border-carbon-200 bg-carbon-900 py-3.5 text-chalk">
      <div className="flex w-max animate-marquee" aria-hidden>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {CAPABILITIES.map((c) => (
              <span key={c} className="flex items-center">
                <span className="eyebrow whitespace-nowrap px-7 text-carbon-300">{c}</span>
                <span className="h-1 w-1 rounded-full bg-field-500" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">
        Capabilities: {CAPABILITIES.join(', ')}.
      </span>
    </div>
  )
}
