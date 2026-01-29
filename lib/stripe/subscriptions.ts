import { stripe } from './client'

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 30, // €30 or ₽3000
    priceRub: 3000, // Price in rubles for Russian market
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    limits: {
      competitors: 5,
      products: 20,
      alerts: 10,
    },
  },
  pro: {
    name: 'Pro',
    price: 50, // €50 or ₽5000
    priceRub: 5000,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    limits: {
      competitors: 15,
      products: 100,
      alerts: 50,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 80, // €80 or ₽8000
    priceRub: 8000,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    limits: {
      competitors: -1, // unlimited
      products: -1, // unlimited
      alerts: -1, // unlimited
    },
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
    metadata: {
      userId,
    },
  })
}

export async function createCustomerPortalSession(customerId: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
  })
}
