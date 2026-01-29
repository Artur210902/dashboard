import { createClient } from '@supabase/supabase-js'
import { sendAlertEmail } from '@/lib/email/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkAlerts(
  productId: string,
  competitorId: string,
  newPrice: number
) {
  try {
    // Get all active alerts for this product/competitor
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select(`
        *,
        user:users(email, full_name),
        product:products(name, target_price)
      `)
      .eq('is_active', true)
      .or(`product_id.eq.${productId},product_id.is.null`)
      .or(`competitor_id.eq.${competitorId},competitor_id.is.null`)

    if (alertsError || !alerts) {
      return
    }

    // Get previous price
    const { data: previousPrice } = await supabase
      .from('price_history')
      .select('price')
      .eq('product_id', productId)
      .eq('competitor_id', competitorId)
      .order('scraped_at', { ascending: false })
      .limit(2)

    const oldPrice =
      previousPrice && previousPrice.length > 1
        ? previousPrice[1].price
        : null

    for (const alert of alerts) {
      let shouldTrigger = false
      let message = ''

      // Check if alert applies to this product/competitor
      if (alert.product_id && alert.product_id !== productId) continue
      if (alert.competitor_id && alert.competitor_id !== competitorId) continue

      const product = alert.product as any
      const user = alert.user as any

      switch (alert.alert_type) {
        case 'price_drop':
          if (oldPrice && newPrice < oldPrice) {
            const dropPercent = ((oldPrice - newPrice) / oldPrice) * 100
            if (alert.threshold && dropPercent >= alert.threshold) {
              shouldTrigger = true
              message = `Цена упала на ${dropPercent.toFixed(2)}%: ${product.name} - было €${oldPrice.toFixed(2)}, стало €${newPrice.toFixed(2)}`
            } else if (!alert.threshold) {
              shouldTrigger = true
              message = `Цена упала: ${product.name} - было €${oldPrice.toFixed(2)}, стало €${newPrice.toFixed(2)}`
            }
          }
          break

        case 'price_increase':
          if (oldPrice && newPrice > oldPrice) {
            const increasePercent = ((newPrice - oldPrice) / oldPrice) * 100
            if (alert.threshold && increasePercent >= alert.threshold) {
              shouldTrigger = true
              message = `Цена выросла на ${increasePercent.toFixed(2)}%: ${product.name} - было €${oldPrice.toFixed(2)}, стало €${newPrice.toFixed(2)}`
            } else if (!alert.threshold) {
              shouldTrigger = true
              message = `Цена выросла: ${product.name} - было €${oldPrice.toFixed(2)}, стало €${newPrice.toFixed(2)}`
            }
          }
          break

        case 'target_reached':
          if (product.target_price && newPrice <= product.target_price) {
            shouldTrigger = true
            message = `Достигнута целевая цена: ${product.name} - цена €${newPrice.toFixed(2)} (цель: €${product.target_price.toFixed(2)})`
          }
          break
      }

      if (shouldTrigger && message) {
        // Send email
        if (user.email) {
          await sendAlertEmail(
            user.email,
            `Алерт: ${product.name}`,
            `<h2>Уведомление о цене</h2><p>${message}</p>`
          )
        }

        // Log alert
        await supabase.from('alert_logs').insert({
          alert_id: alert.id,
          message,
          sent_at: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('Alert check error:', error)
  }
}
