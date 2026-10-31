/* ===========================================================================
   Size guides.

   Deliberately per-garment-type rather than one global table. A leggings size
   chart that quotes chest measurements is the single most common source of
   apparel returns, and the research on premium PDPs is unambiguous that a
   context-aware guide is what removes the anxiety.
   =========================================================================== */

export type SizeRow = { size: string; values: string[] }
export type SizeGuide = { columns: string[]; rows: SizeRow[]; note: string }

const TOPS: SizeGuide = {
  columns: ['Chest (cm)', 'Body length (cm)', 'Sleeve (cm)'],
  rows: [
    { size: 'XS', values: ['86-91', '66', '19'] },
    { size: 'S', values: ['91-97', '69', '20'] },
    { size: 'M', values: ['97-102', '72', '21'] },
    { size: 'L', values: ['102-107', '74', '22'] },
    { size: 'XL', values: ['107-112', '76', '23'] },
    { size: 'XXL', values: ['112-122', '79', '24'] },
  ],
  note: 'Measure around the fullest part of the chest, under the arms, with the tape level.',
}

const LEGS: SizeGuide = {
  columns: ['Waist (cm)', 'Hip (cm)', 'Inseam (cm)'],
  rows: [
    { size: 'XS', values: ['66-71', '86-91', '19'] },
    { size: 'S', values: ['71-76', '91-97', '20'] },
    { size: 'M', values: ['76-84', '97-102', '20'] },
    { size: 'L', values: ['84-91', '102-107', '21'] },
    { size: 'XL', values: ['91-99', '107-112', '22'] },
    { size: 'XXL', values: ['99-109', '112-122', '23'] },
  ],
  note: 'Measure the waist at its narrowest point, not at the trouser line.',
}

const TIGHTS: SizeGuide = {
  columns: ['Waist (cm)', 'Hip (cm)', 'Inseam (cm)'],
  rows: [
    { size: 'XS', values: ['61-66', '86-91', '64'] },
    { size: 'S', values: ['66-71', '91-97', '66'] },
    { size: 'M', values: ['71-79', '97-102', '68'] },
    { size: 'L', values: ['79-86', '102-107', '70'] },
    { size: 'XL', values: ['86-94', '107-112', '71'] },
    { size: 'XXL', values: ['94-104', '112-122', '72'] },
  ],
  note: 'Compression is cut small on purpose. If you are between sizes, take the larger one.',
}

const CAP: SizeGuide = {
  columns: ['Head circumference (cm)', 'Adjuster range'],
  rows: [{ size: 'OS', values: ['54-61', 'Brass slider, 7 cm'] }],
  note: 'Measure around the head just above the ears.',
}

export function guideFor(category: string): SizeGuide {
  if (category === 'cap') return CAP
  if (category === 'tights') return TIGHTS
  if (category === 'shorts') return LEGS
  return TOPS
}

/**
 * Fit advice shown next to the size selector. This is the sentence that stops
 * someone ordering the wrong size, so it is keyed on the actual cut.
 */
export const FIT_ADVICE: Record<string, string> = {
  compression: 'Cut close and designed to be tight. Between sizes? Size up.',
  athletic: 'Trim through the body with room to move. Takes your usual size.',
  regular: 'A standard cut, neither close nor loose. Takes your usual size.',
  relaxed: 'Deliberately roomy and boxy. Size down for a closer fit.',
}
