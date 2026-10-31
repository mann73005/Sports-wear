import { z } from 'zod'
import { customizationSchema } from './customization'

/**
 * What the browser is allowed to send at checkout.
 *
 * Note what is NOT here: prices. The client sends identifiers, sizes,
 * quantities and the print spec; the route handler looks the product up and
 * rebuilds every figure itself. A posted total is never trusted.
 */

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  colorName: z.string().min(1),
  bodyHex: z.string().regex(/^#[0-9a-f]{3,8}$/i),
  accentHex: z.string().regex(/^#[0-9a-f]{3,8}$/i),
  trimHex: z.string().regex(/^#[0-9a-f]{3,8}$/i),
  quantity: z.number().int().min(1).max(999),
  customization: customizationSchema.nullable(),
})

export const checkoutSchema = z.object({
  email: z.string().email('Enter a valid email — the order reference is sent there'),
  name: z.string().min(2, 'Enter the name the order is for'),
  phone: z.string().optional(),

  addressLine1: z.string().min(3, 'Enter a street address'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Enter a city'),
  region: z.string().min(1, 'Enter a state, county or region'),
  postcode: z.string().min(3, 'Enter a postcode'),
  country: z.string().min(2, 'Enter a country'),

  shippingMethod: z.enum(['standard', 'express', 'rush']),
  notes: z.string().max(500).optional(),

  items: z.array(checkoutItemSchema).min(1, 'There is nothing in the cart'),
})

export type CheckoutPayload = z.infer<typeof checkoutSchema>
export type CheckoutItem = z.infer<typeof checkoutItemSchema>

export const statusPatchSchema = z.object({
  status: z.enum([
    'received',
    'artwork',
    'printing',
    'stitching',
    'qc',
    'dispatched',
    'delivered',
    'cancelled',
  ]),
  note: z.string().max(300).optional(),
})
