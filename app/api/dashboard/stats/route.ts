import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts
    const [competitorsResult, productsResult, priceHistoryResult] =
      await Promise.all([
        supabase
          .from('competitors')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('price_history')
          .select('id', { count: 'exact', head: true })
          .in(
            'product_id',
            (
              await supabase
                .from('products')
                .select('id')
                .eq('user_id', user.id)
            ).data?.map((p) => p.id) || []
          ),
      ])

    // Get recent price changes (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentPrices } = await supabase
      .from('price_history')
      .select(
        `
        *,
        product:products!inner(name, user_id),
        competitor:competitors(name)
      `
      )
      .gte('scraped_at', sevenDaysAgo.toISOString())
      .eq('product.user_id', user.id)
      .order('scraped_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      competitors: competitorsResult.count || 0,
      products: productsResult.count || 0,
      priceRecords: priceHistoryResult.count || 0,
      recentPrices: recentPrices || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
