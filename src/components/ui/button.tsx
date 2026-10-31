import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Actions are carbon. The brand green is for brand moments, not buttons —
 * keeping the two apart is most of what stops the page looking like a theme.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.985]',
  {
    variants: {
      variant: {
        primary:
          'bg-carbon-900 text-chalk hover:bg-carbon-800 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.22)]',
        brand: 'bg-field-700 text-chalk hover:bg-field-600',
        outline: 'border border-carbon-300 bg-transparent hover:bg-carbon-100 hover:border-carbon-400',
        subtle: 'bg-carbon-100 text-carbon-900 hover:bg-carbon-200',
        ghost: 'hover:bg-carbon-100 text-carbon-700 hover:text-carbon-900',
        inverse: 'bg-chalk text-carbon-900 hover:bg-white',
        danger: 'bg-danger text-white hover:brightness-110',
        link: 'text-carbon-900 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 rounded-sm px-3.5 text-[13px] [&_svg]:size-4',
        md: 'h-11 rounded-md px-5 text-sm [&_svg]:size-4',
        lg: 'h-14 rounded-md px-8 text-[15px] [&_svg]:size-[18px]',
        icon: 'h-10 w-10 rounded-sm [&_svg]:size-[18px]',
        iconSm: 'h-8 w-8 rounded-xs [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
