import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCustomerPortalSession } from '@/lib/stripe/subscriptions'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    const session = await createCustomerPortalSession(
      userData.stripe_customer_id
    )

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
