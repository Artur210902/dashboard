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
    const alertId = searchParams.get('alert_id')

    let query = supabase
      .from('alert_logs')
      .select(`
        *,
        alert:alerts!inner(user_id)
      `)
      .eq('alert.user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(50)

    if (alertId) {
      query = query.eq('alert_id', alertId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
