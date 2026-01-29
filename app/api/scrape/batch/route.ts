import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scrapePrice } from '@/lib/scraper/scraper'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active product-competitor links for this user
    const { data: productCompetitors, error: pcError } = await supabase
      .from('product_competitors')
      .select(`
        *,
        product:products!inner(user_id),
        competitor:competitors!inner(*)
      `)
      .eq('product.user_id', user.id)
      .eq('competitor.is_active', true)

    if (pcError) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    if (!productCompetitors || productCompetitors.length === 0) {
      return NextResponse.json({
        success: true,
        scraped: 0,
        results: [],
      })
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = []
    const errors = []

    // Scrape each product-competitor combination
    for (const pc of productCompetitors) {
      try {
        const competitor = pc.competitor as any
        const result = await scrapePrice(
          pc.product_url,
          competitor.price_selector,
          competitor.name_selector
        )

        if (result.price !== null && !result.error) {
          // Save to price history
          const { error: insertError } = await serviceClient
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
              name: result.name,
            })
          } else {
            errors.push({
              product_id: pc.product_id,
              competitor_id: pc.competitor_id,
              error: 'Failed to save price',
            })
          }
        } else {
          errors.push({
            product_id: pc.product_id,
            competitor_id: pc.competitor_id,
            error: result.error || 'Price not found',
          })
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
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
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Batch scrape error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
