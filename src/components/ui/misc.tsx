'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/* --- separator ------------------------------------------------------------ */

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-carbon-200',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
))
Separator.displayName = 'Separator'

/* --- accordion ------------------------------------------------------------ */

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b border-carbon-200', className)} {...props} />
))
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:text-field-700 [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-carbon-400 transition-transform duration-300" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-5 pt-0 text-carbon-600 leading-relaxed', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'

/* --- tabs ----------------------------------------------------------------- */

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex items-center gap-1 border-b border-carbon-200 w-full', className)}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative px-4 py-3 text-sm font-medium text-carbon-500 transition-colors hover:text-carbon-900',
      'data-[state=active]:text-carbon-900',
      'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-carbon-900 after:scale-x-0 after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('pt-6 focus-visible:outline-none', className)}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

/* --- slider --------------------------------------------------------------- */

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-carbon-200">
      <SliderPrimitive.Range className="absolute h-full bg-carbon-900" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-carbon-900 bg-chalk shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-700/30" />
  </SliderPrimitive.Root>
))
Slider.displayName = 'Slider'

/* --- tooltip -------------------------------------------------------------- */

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({
  children,
  label,
  side = 'top',
}: {
  children: React.ReactNode
  label: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-[260px] rounded-sm bg-carbon-900 px-2.5 py-1.5 text-xs leading-snug text-chalk shadow-lg data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-carbon-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* --- skeleton ------------------------------------------------------------- */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-sm bg-carbon-200/70', className)} {...props} />
}
