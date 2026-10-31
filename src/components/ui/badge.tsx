import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-xs font-mono text-[10px] font-medium uppercase tracking-[0.14em] px-2 py-1 leading-none',
  {
    variants: {
      variant: {
        default: 'bg-carbon-900 text-chalk',
        brand: 'bg-field-700 text-chalk',
        signal: 'bg-signal-500 text-white',
        outline: 'border border-carbon-300 text-carbon-600',
        muted: 'bg-carbon-100 text-carbon-600',
        ok: 'bg-ok/12 text-ok',
        warn: 'bg-warn/14 text-warn',
        danger: 'bg-danger/12 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
