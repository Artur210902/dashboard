'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/subscriptions'
import { isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram/client'

interface UserSubscription {
  subscription_tier: 'basic' | 'pro' | 'enterprise' | null
  subscription_status: 'active' | 'canceled' | 'past_due' | null
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setSubscription({
          subscription_tier: data.subscription_tier,
          subscription_status: data.subscription_status,
        })
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (tier: keyof typeof SUBSCRIPTION_PLANS) => {
    setProcessing(tier)
    try {
      const plan = SUBSCRIPTION_PLANS[tier]
      const isTelegram = isTelegramWebApp()
      
      // Use YooKassa for Russian cards, Stripe for others
      if (isTelegram || navigator.language.startsWith('ru')) {
        // Use YooKassa payment
        const response = await fetch('/api/payments/yookassa/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create payment')
        }

        const { confirmationUrl } = await response.json()
        if (confirmationUrl) {
          if (isTelegram) {
            const webApp = getTelegramWebApp()
            webApp?.openLink(confirmationUrl)
          } else {
            window.location.href = confirmationUrl
          }
        }
      } else {
        // Use Stripe for international users
        const response = await fetch('/api/subscription/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: plan.priceId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create checkout session')
        }

        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      }
    } catch (error: any) {
      toast.error(error.message)
      setProcessing(null)
    }
  }

  const handleManage = async () => {
    setProcessing('manage')
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      toast.error(error.message)
      setProcessing(null)
    }
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  const currentTier = subscription?.subscription_tier
  const isActive = subscription?.subscription_status === 'active'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Подписка</h1>
        <p className="text-muted-foreground">
          Выберите план для отслеживания цен конкурентов
        </p>
      </div>

      {isActive && currentTier && (
        <Card>
          <CardHeader>
            <CardTitle>Текущая подписка</CardTitle>
            <CardDescription>
              Вы используете план {SUBSCRIPTION_PLANS[currentTier].name}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleManage} disabled={processing === 'manage'}>
              {processing === 'manage' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Управление подпиской'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(SUBSCRIPTION_PLANS).map(([tier, plan]) => {
          const isCurrentTier = currentTier === tier
          // Determine if this is an upgrade, downgrade, or same tier
          const tierOrder = { basic: 1, pro: 2, enterprise: 3 }
          const currentTierOrder = currentTier ? tierOrder[currentTier] : 0
          const targetTierOrder = tierOrder[tier as keyof typeof tierOrder]
          const isUpgrade = !currentTier || targetTierOrder > currentTierOrder

          return (
            <Card
              key={tier}
              className={isCurrentTier ? 'border-primary' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">
                    {isTelegramWebApp() || navigator.language.startsWith('ru') 
                      ? `${plan.price}₽` 
                      : `€${plan.price}`}
                  </span>
                  <span className="text-muted-foreground">/месяц</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      {plan.limits.competitors === -1
                        ? 'Безлимитные конкуренты'
                        : `${plan.limits.competitors} конкурентов`}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      {plan.limits.products === -1
                        ? 'Безлимитные продукты'
                        : `${plan.limits.products} продуктов`}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      {plan.limits.alerts === -1
                        ? 'Безлимитные алерты'
                        : `${plan.limits.alerts} алертов`}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>Автоматический скрапинг</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>Email уведомления</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentTier ? (
                  <Button className="w-full" disabled>
                    Текущий план
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(tier as keyof typeof SUBSCRIPTION_PLANS)}
                    disabled={processing !== null}
                  >
                    {processing === tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обработка...
                      </>
                    ) : isActive ? (
                      'Сменить план'
                    ) : (
                      'Подписаться'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
