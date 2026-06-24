import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 999, // pence
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    name: 'Yearly',
    price: 9999,
    interval: 'year' as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
}
