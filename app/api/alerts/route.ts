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

    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        product:products(name),
        competitor:competitors(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
    const {
      product_id,
      competitor_id,
      alert_type,
      threshold,
      is_active,
    } = body

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        product_id: product_id || null,
        competitor_id: competitor_id || null,
        alert_type,
        threshold: threshold ? parseFloat(threshold) : null,
        is_active: is_active ?? true,
      })
      .select(`
        *,
        product:products(name),
        competitor:competitors(name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
