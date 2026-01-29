import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapePrice } from '@/lib/scraper/scraper'

// Verify the request is from Vercel Cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all active product-competitor links
    const { data: productCompetitors, error: pcError } = await supabase
      .from('product_competitors')
      .select(`
        *,
        product:products!inner(*),
        competitor:competitors!inner(*)
      `)
      .eq('competitor.is_active', true)

    if (pcError || !productCompetitors) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    const results = []
    const errors = []

    for (const pc of productCompetitors) {
      try {
        const competitor = pc.competitor as any
        const result = await scrapePrice(
          pc.product_url,
          competitor.price_selector,
          competitor.name_selector
        )

        if (result.price !== null && !result.error) {
          const { error: insertError } = await supabase
            .from('price_history')
            .insert({
              product_id: pc.product_id,
              competitor_id: pc.competitor_id,
              price: result.price,
              currency: 'EUR',
              scraped_at: new Date().toISOString(),
            })

          if (!insertError) {
            results.push({
              product_id: pc.product_id,
              competitor_id: pc.competitor_id,
              price: result.price,
            })
          } else {
            errors.push({
              product_id: pc.product_id,
              competitor_id: pc.competitor_id,
              error: 'Failed to save',
            })
          }
        } else {
          errors.push({
            product_id: pc.product_id,
            competitor_id: pc.competitor_id,
            error: result.error || 'Price not found',
          })
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error: any) {
        errors.push({
          product_id: pc.product_id,
          competitor_id: pc.competitor_id,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      scraped: results.length,
      errors: errors.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron scrape error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
