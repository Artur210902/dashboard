import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          const priceId = subscription.items.data[0].price.id

          // Determine tier from price ID
          let tier: 'basic' | 'pro' | 'enterprise' | null = null
          if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
            tier = 'basic'
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            tier = 'pro'
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            tier = 'enterprise'
          }

          await supabase
            .from('users')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          if (subscription.status === 'active') {
            const priceId = subscription.items.data[0].price.id
            let tier: 'basic' | 'pro' | 'enterprise' | null = null
            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
              tier = 'basic'
            } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
              tier = 'pro'
            } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
              tier = 'enterprise'
            }

            await supabase
              .from('users')
              .update({
                subscription_tier: tier,
                subscription_status: 'active',
              })
              .eq('id', user.id)
          } else {
            await supabase
              .from('users')
              .update({
                subscription_status:
                  subscription.status === 'canceled' ? 'canceled' : 'past_due',
              })
              .eq('id', user.id)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
