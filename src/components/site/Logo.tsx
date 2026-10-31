import { cn } from '@/lib/utils'

/**
 * The mark is a chevron knocked out of a rounded square — a stylised A, and
 * the same angle that runs through the sleeve panels on the kit. Knocked out
 * with evenodd rather than painted, so it works on any background colour with
 * nothing but `currentColor`.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 28 28" className="h-6 w-6 shrink-0" aria-hidden>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          d="M5 0 H23 A5 5 0 0 1 28 5 V23 A5 5 0 0 1 23 28 H5 A5 5 0 0 1 0 23 V5 A5 5 0 0 1 5 0 Z
             M14 6.2 L21.8 21.8 L17.3 21.8 L14 15 L10.7 21.8 L6.2 21.8 Z"
        />
      </svg>
      <span className="font-display text-[17px] font-bold tracking-[-0.03em] leading-none">
        ATHLON
      </span>
    </span>
  )
}
