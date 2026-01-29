import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const competitorId = searchParams.get('competitor_id')
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from('price_history')
      .select(
        `
        *,
        product:products!inner(name, user_id),
        competitor:competitors(name)
      `
      )
      .gte('scraped_at', startDate.toISOString())
      .eq('product.user_id', user.id)
      .order('scraped_at', { ascending: true })

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (competitorId) {
      query = query.eq('competitor_id', competitorId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
