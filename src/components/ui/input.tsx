import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full bg-white border border-carbon-200 rounded-sm px-3.5 text-sm text-carbon-900 placeholder:text-carbon-400 transition-colors duration-150 hover:border-carbon-300 focus:border-field-700 focus:outline-none focus:ring-2 focus:ring-field-700/15 disabled:bg-carbon-50 disabled:text-carbon-400 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, 'py-2.5 min-h-24 resize-y', className)} {...props} />
))
Textarea.displayName = 'Textarea'

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('eyebrow text-carbon-500 block mb-2', className)}
    {...props}
  />
))
Label.displayName = 'Label'

/** Label + control + error, so forms stay consistent without repetition. */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-signal-500 ml-1">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-carbon-500">{hint}</p>
      ) : null}
    </div>
  )
}
