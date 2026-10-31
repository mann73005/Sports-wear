'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'

/**
 * Shown once, straight after checkout. Confirms the thing people actually
 * worry about at this moment: that the order exists and where the reference
 * went, with the reference itself already visible in the heading below.
 */
export function PlacedBanner({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex items-start gap-4 rounded-xl border border-ok/25 bg-ok/5 p-5"
    >
      <motion.span
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.15 }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok text-white"
      >
        <Check className="h-4.5 w-4.5" />
      </motion.span>
      <div>
        <p className="font-display text-base font-bold">That is on the floor.</p>
        <p className="mt-1 text-sm leading-relaxed text-carbon-600">
          Your reference has been sent to <span className="font-medium">{email}</span>. Keep it —
          it is how you check on the order, and there is no account to log into.
        </p>
      </div>
    </motion.div>
  )
}
