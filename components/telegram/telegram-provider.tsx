'use client'

import { useEffect } from 'react'
import { isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram/client'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isTelegramWebApp()) {
      const webApp = getTelegramWebApp()
      if (webApp) {
        // Initialize Telegram Web App
        webApp.ready()
        
        // Expand the app to full height
        webApp.expand()
        
        // Apply theme colors
        if (webApp.themeParams.bg_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-bg-color',
            webApp.themeParams.bg_color
          )
        }
        if (webApp.themeParams.text_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-text-color',
            webApp.themeParams.text_color
          )
        }
        if (webApp.themeParams.button_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-button-color',
            webApp.themeParams.button_color
          )
        }
        if (webApp.themeParams.button_text_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-button-text-color',
            webApp.themeParams.button_text_color
          )
        }
      }
    }
  }, [])

  return <>{children}</>
}
