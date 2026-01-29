import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, object } = body

    // Verify webhook signature if provided
    const signature = request.headers.get('x-yookassa-signature')
    if (signature && process.env.YOOKASSA_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.YOOKASSA_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Handle payment events
    if (event === 'payment.succeeded') {
      const payment = object
      const userId = payment.metadata?.userId
      const tier = payment.metadata?.tier

      if (userId && tier) {
        // Update user subscription
        await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', userId)
      }
    } else if (event === 'payment.canceled') {
      const payment = object
      const userId = payment.metadata?.userId

      if (userId) {
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
          })
          .eq('id', userId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('YooKassa webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
