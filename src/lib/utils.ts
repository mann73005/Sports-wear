import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Every amount in this app is an integer number of cents. Formatting is the
 * only place it becomes a decimal, so rounding errors can't accumulate.
 */
export function formatMoney(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Order references look like ATH-7K2M-4QX9. Ambiguous glyphs (0/O, 1/I) are
 * excluded so a reference read off a packing slip over the phone survives.
 */
const REF_ALPHABET = '23456789ACDEFGHJKLMNPQRSTUVWXYZ'

export function generateOrderNumber() {
  const block = (n: number) =>
    Array.from(
      { length: n },
      () => REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)],
    ).join('')
  return `ATH-${block(4)}-${block(4)}`
}

/** Readable contrast colour for text sitting on an arbitrary swatch. */
export function contrastOn(hex: string): '#0b0c0c' | '#ffffff' {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  // Relative luminance, sRGB (WCAG 2.x).
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return L > 0.42 ? '#0b0c0c' : '#ffffff'
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
