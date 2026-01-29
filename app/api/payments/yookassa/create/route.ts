import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { YooKassaClient } from '@/lib/payments/yookassa'
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '@/lib/stripe/subscriptions'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = body

    if (!tier || !(tier in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier]
    const amount = plan.priceRub || plan.price * 100 // Use rubles price or convert euros

    if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const yookassa = new YooKassaClient(
      process.env.YOOKASSA_SHOP_ID,
      process.env.YOOKASSA_SECRET_KEY,
      process.env.YOOKASSA_TEST_MODE === 'true'
    )

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription?payment=success`
    const description = `Подписка ${plan.name} - ${amount}₽/месяц`

    const payment = await yookassa.createPayment(
      amount,
      'RUB',
      description,
      returnUrl,
      {
        userId: user.id,
        tier,
      }
    )

    const confirmationUrl = 
      (payment as any).confirmation?.confirmation_url || 
      (payment as any).confirmation_url ||
      null

    if (!confirmationUrl) {
      return NextResponse.json(
        { error: 'Failed to get payment confirmation URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl,
    })
  } catch (error: any) {
    console.error('YooKassa payment creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
