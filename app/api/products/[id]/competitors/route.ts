import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify product belongs to user BEFORE querying product_competitors
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single()

    if (productError) throw productError

    if (!product || product.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Now safe to query product_competitors
    const { data, error } = await supabase
      .from('product_competitors')
      .select(`
        *,
        competitor:competitors(*)
      `)
      .eq('product_id', id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { competitor_id, product_url } = body

    // Verify product belongs to user
    const { data: product } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!product || product.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('product_competitors')
      .insert({
        product_id: id,
        competitor_id,
        product_url,
      })
      .select(`
        *,
        competitor:competitors(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')

    if (!competitorId) {
      return NextResponse.json(
        { error: 'competitor_id is required' },
        { status: 400 }
      )
    }

    // Verify product belongs to user
    const { data: product } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!product || product.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('product_competitors')
      .delete()
      .eq('product_id', id)
      .eq('competitor_id', competitorId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
