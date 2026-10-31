'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { AlertCircle, ArrowLeft, Check, Loader2, Lock } from 'lucide-react'
import { cartSubtotal, lineBreakdown, lineQuantity, useCart } from '@/lib/cart-store'
import { SHIPPING_METHODS, shippingCost, TAX_RATE, type ShippingMethodId } from '@/lib/pricing'
import { cn, formatMoney } from '@/lib/utils'
import { Garment } from '@/art/Garment'
import type { GarmentType } from '@/art/garment-paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field, Input } from '@/components/ui/input'
import { Separator, Skeleton } from '@/components/ui/misc'

type Errors = Record<string, string>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clear } = useCart()

  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [method, setMethod] = useState<ShippingMethodId>('standard')

  useEffect(() => setMounted(true), [])

  // An empty cart has nothing to check out; send them back rather than
  // showing a form that cannot succeed.
  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) router.replace('/cart')
  }, [mounted, items.length, submitting, router])

  if (!mounted) {
    return (
      <div className="gutter py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    )
  }
  if (items.length === 0) return null

  const subtotal = cartSubtotal(items)
  const shipping = shippingCost(method, subtotal)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + shipping + tax
  const units = items.reduce((n, i) => n + lineQuantity(i), 0)
  const hasCustom = items.some((i) => i.customization)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const form = new FormData(e.currentTarget)
    const payload = {
      email: String(form.get('email') ?? ''),
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      addressLine1: String(form.get('addressLine1') ?? ''),
      addressLine2: String(form.get('addressLine2') ?? ''),
      city: String(form.get('city') ?? ''),
      region: String(form.get('region') ?? ''),
      postcode: String(form.get('postcode') ?? ''),
      country: String(form.get('country') ?? ''),
      shippingMethod: method,
      notes: String(form.get('notes') ?? ''),
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        colorName: i.colorName,
        bodyHex: i.bodyHex,
        accentHex: i.accentHex,
        trimHex: i.trimHex,
        quantity: i.quantity,
        customization: i.customization,
      })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.issues) {
          setErrors(
            Object.fromEntries(
              (data.issues as { field: string; message: string }[]).map((i) => [
                i.field,
                i.message,
              ]),
            ),
          )
          toast.error('Check the highlighted fields')
        } else {
          toast.error(data.error ?? 'Could not place the order')
        }
        setSubmitting(false)
        return
      }

      // Clear only after the server has confirmed — a failed request must
      // never cost somebody the kit they spent twenty minutes building.
      clear()
      router.push(`/orders/${data.number}?email=${encodeURIComponent(payload.email)}&placed=1`)
    } catch {
      toast.error('Network error', { description: 'The order was not placed. Try again.' })
      setSubmitting(false)
    }
  }

  return (
    <div className="gutter py-10 lg:py-14">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs text-carbon-500 transition-colors hover:text-carbon-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to cart
      </Link>

      <h1 className="text-display-lg mt-3 font-display font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="space-y-10">
          {/* --- contact -------------------------------------------------- */}
          <section>
            <SectionHead n="01" title="Contact" />
            <p className="mb-5 text-sm text-carbon-500">
              The order reference goes to this address. There is no account to create — the
              reference plus this email is how you look the order up later.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="coach@club.org"
                  aria-invalid={!!errors.email}
                />
              </Field>
              <Field label="Full name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Dani Okonjo"
                  aria-invalid={!!errors.name}
                />
              </Field>
              <Field label="Phone" htmlFor="phone" hint="For delivery problems only.">
                <Input id="phone" name="phone" type="tel" autoComplete="tel" />
              </Field>
            </div>
          </section>

          {/* --- address -------------------------------------------------- */}
          <section>
            <SectionHead n="02" title="Delivery address" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Street address"
                htmlFor="addressLine1"
                required
                error={errors.addressLine1}
                className="sm:col-span-2"
              >
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  autoComplete="address-line1"
                  required
                  aria-invalid={!!errors.addressLine1}
                />
              </Field>
              <Field label="Apartment, unit" htmlFor="addressLine2" className="sm:col-span-2">
                <Input id="addressLine2" name="addressLine2" autoComplete="address-line2" />
              </Field>
              <Field label="City" htmlFor="city" required error={errors.city}>
                <Input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  required
                  aria-invalid={!!errors.city}
                />
              </Field>
              <Field label="State / region" htmlFor="region" required error={errors.region}>
                <Input
                  id="region"
                  name="region"
                  autoComplete="address-level1"
                  required
                  aria-invalid={!!errors.region}
                />
              </Field>
              <Field label="Postcode" htmlFor="postcode" required error={errors.postcode}>
                <Input
                  id="postcode"
                  name="postcode"
                  autoComplete="postal-code"
                  required
                  aria-invalid={!!errors.postcode}
                />
              </Field>
              <Field label="Country" htmlFor="country" required error={errors.country}>
                <Input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  required
                  defaultValue="United States"
                  aria-invalid={!!errors.country}
                />
              </Field>
            </div>
          </section>

          {/* --- shipping ------------------------------------------------- */}
          <section>
            <SectionHead n="03" title="Shipping" />
            {hasCustom ? (
              <p className="mb-5 flex items-start gap-2.5 rounded-sm border border-carbon-200 bg-carbon-50 p-3.5 text-[13px] text-carbon-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-field-700" />
                This order contains custom pieces, so transit time is on top of production time.
                Rush moves the whole order to the front of the floor queue.
              </p>
            ) : null}

            <div className="grid gap-2.5">
              {Object.values(SHIPPING_METHODS).map((m) => {
                const cost = shippingCost(m.id as ShippingMethodId, subtotal)
                const free = cost === 0 && m.price > 0
                return (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all duration-200',
                      method === m.id
                        ? 'border-carbon-900 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                        : 'border-carbon-200 bg-white/60 hover:border-carbon-400',
                    )}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={m.id}
                      checked={method === m.id}
                      onChange={() => setMethod(m.id as ShippingMethodId)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                        method === m.id ? 'border-carbon-900 bg-carbon-900' : 'border-carbon-300',
                      )}
                    >
                      {method === m.id ? <Check className="h-2.5 w-2.5 text-chalk" /> : null}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block text-xs text-carbon-500">{m.days}</span>
                    </span>
                    <span className="tabular shrink-0 text-sm font-medium">
                      {cost === 0 ? (
                        <span className={free ? 'text-ok' : undefined}>Free</span>
                      ) : (
                        formatMoney(cost)
                      )}
                    </span>
                  </label>
                )
              })}
            </div>

            <Field label="Delivery note" htmlFor="notes" className="mt-5">
              <Input id="notes" name="notes" placeholder="Gate code, safe place, clubhouse hours" />
            </Field>
          </section>
        </div>

        {/* --- summary ---------------------------------------------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-carbon-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold">
              Order summary
              <span className="tabular ml-2 text-xs font-normal text-carbon-500">
                {units} piece{units === 1 ? '' : 's'}
              </span>
            </h2>

            <ul className="mt-5 max-h-72 space-y-3.5 overflow-y-auto">
              {items.map((item) => {
                const b = lineBreakdown(item)
                return (
                  <li key={item.id} className="flex gap-3">
                    <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-carbon-100">
                      <Garment
                        type={item.category as GarmentType}
                        bodyHex={item.bodyHex}
                        accentHex={item.accentHex}
                        trimHex={item.trimHex}
                        customization={item.customization}
                        shadow={false}
                        className="scale-110"
                      />
                      <span className="tabular absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-carbon-900 px-1 text-[10px] text-chalk">
                        {lineQuantity(item)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{item.name}</span>
                      <span className="tabular block text-[11px] text-carbon-500">
                        {item.colorName} · {item.size}
                      </span>
                      {item.customization ? (
                        <Badge variant="brand" className="mt-1">
                          Custom
                        </Badge>
                      ) : null}
                    </span>
                    <span className="tabular shrink-0 text-[13px]">
                      {formatMoney(b.lineTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>

            <Separator className="my-4" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-carbon-600">Subtotal</dt>
                <dd className="tabular">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Shipping</dt>
                <dd className="tabular">{shipping === 0 ? 'Free' : formatMoney(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-carbon-600">Tax</dt>
                <dd className="tabular">{formatMoney(tax)}</dd>
              </div>
            </dl>

            <Separator className="my-4" />

            <div className="flex items-baseline justify-between">
              <span className="font-medium">Total</span>
              <motion.span
                key={total}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="tabular font-display text-2xl font-bold"
              >
                {formatMoney(total)}
              </motion.span>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Placing the order
                </>
              ) : (
                <>
                  <Lock />
                  Place order · {formatMoney(total)}
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-carbon-500">
              This is a demonstration build. No payment is taken and no card details are
              collected — placing the order writes it to the local database so you can track it.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3 border-b border-carbon-200 pb-3">
      <span className="tabular font-display text-sm text-carbon-300">{n}</span>
      <h2 className="font-display text-lg font-bold">{title}</h2>
    </div>
  )
}
