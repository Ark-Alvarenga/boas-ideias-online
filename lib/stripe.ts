import type StripeType from 'stripe'

let stripe: StripeType | null = null

export function getStripe(): StripeType {
  if (!stripe) {
    const Stripe = require('stripe') as typeof StripeType
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil' as any,
    })
  }
  return stripe
}
