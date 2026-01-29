'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isTelegramWebApp, getTelegramUser } from '@/lib/telegram/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TelegramAuthPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isTelegramWebApp()) {
      setError('Эта страница доступна только в Telegram')
      setLoading(false)
      return
    }

    handleTelegramAuth()
  }, [])

  const handleTelegramAuth = async () => {
    try {
      const webApp = window.Telegram?.WebApp
      if (!webApp) {
        throw new Error('Telegram WebApp not available')
      }

      const initData = webApp.initData
      const telegramUser = getTelegramUser()

      if (!telegramUser) {
        throw new Error('Telegram user data not available')
      }

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const { session } = await response.json()

      if (session) {
        toast.success('Успешная авторизация!')
        router.push('/dashboard')
        router.refresh()
      } else {
        throw new Error('Session not created')
      }
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Авторизация через Telegram...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ошибка авторизации</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Перейти к обычной авторизации
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
