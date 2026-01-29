import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { initData } = body

    if (!initData) {
      return NextResponse.json(
        { error: 'Telegram initData is required' },
        { status: 400 }
      )
    }

    // Verify Telegram initData
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json(
        { error: 'Telegram bot token not configured' },
        { status: 500 }
      )
    }

    // Parse initData
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    // Create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Verify hash
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 401 }
      )
    }

    // Extract user data
    const userStr = params.get('user')
    if (!userStr) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }

    const telegramUser = JSON.parse(userStr)

    // Create or get user in Supabase
    const supabase = await createClient()
    const telegramId = `telegram_${telegramUser.id}`

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', telegramId)
      .single()

    if (existingUser) {
      // Sign in existing user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: existingUser.email || `${telegramUser.id}@telegram.local`,
        password: telegramId, // Use telegram ID as password
      })

      if (authError) {
        // Create auth user if doesn't exist
        const { data: newAuthData, error: signUpError } = await supabase.auth.signUp({
          email: `${telegramUser.id}@telegram.local`,
          password: telegramId,
          options: {
            data: {
              telegram_id: telegramUser.id,
              full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
            },
          },
        })

        if (signUpError) throw signUpError
        return NextResponse.json({ user: newAuthData.user, session: newAuthData.session })
      }

      return NextResponse.json({ user: authData.user, session: authData.session })
    } else {
      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${telegramUser.id}@telegram.local`,
        password: telegramId,
        options: {
          data: {
            telegram_id: telegramUser.id,
            full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
          },
        },
      })

      if (signUpError) throw signUpError

      // Create user profile
      if (authData.user) {
        await supabase.from('users').insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
        })
      }

      return NextResponse.json({ user: authData.user, session: authData.session })
    }
  } catch (error: any) {
    console.error('Telegram auth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
