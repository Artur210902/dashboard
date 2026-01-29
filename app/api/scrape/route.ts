import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scrapePrice } from '@/lib/scraper/scraper'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { checkAlerts } from '@/lib/alerts/check'

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
    const { product_id, competitor_id, product_url } = body

    if (!product_id || !competitor_id || !product_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get competitor info
    const { data: competitor, error: competitorError } = await supabase
      .from('competitors')
      .select('*')
      .eq('id', competitor_id)
      .eq('user_id', user.id)
      .single()

    if (competitorError || !competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      )
    }

    if (!competitor.is_active) {
      return NextResponse.json(
        { error: 'Competitor is not active' },
        { status: 400 }
      )
    }

    // Scrape the price
    const result = await scrapePrice(
      product_url,
      competitor.price_selector,
      competitor.name_selector
    )

    if (result.error || result.price === null) {
      return NextResponse.json(
        { error: result.error || 'Failed to scrape price' },
        { status: 400 }
      )
    }

    // Save to price history using service role for RLS bypass
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: priceHistory, error: insertError } = await serviceClient
      .from('price_history')
      .insert({
        product_id,
        competitor_id,
        price: result.price,
        currency: 'EUR',
        scraped_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting price history:', insertError)
      return NextResponse.json(
        { error: 'Failed to save price' },
        { status: 500 }
      )
    }

    // Check alerts asynchronously
    checkAlerts(product_id, competitor_id, result.price).catch((error) => {
      console.error('Alert check error:', error)
    })

    return NextResponse.json({
      success: true,
      price: result.price,
      name: result.name,
      priceHistory,
    })
  } catch (error: any) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
