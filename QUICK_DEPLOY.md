# Быстрый деплой на Vercel

## Через веб-интерфейс (рекомендуется)

### Шаг 1: Подготовка репозитория

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Шаг 2: Деплой на Vercel

1. Откройте https://vercel.com/new
2. Войдите через GitHub/GitLab/Bitbucket
3. Импортируйте ваш репозиторий
4. Vercel автоматически определит Next.js

### Шаг 3: Добавьте переменные окружения

В настройках проекта → Environment Variables добавьте:

**Обязательные:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (обновите после получения URL)

**Для Stripe:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ENTERPRISE_PRICE_ID`

**Для Telegram:**
- `TELEGRAM_BOT_TOKEN`

**Для YooKassa:**
- `YOOKASSA_SHOP_ID`
- `YOOKASSA_SECRET_KEY`
- `YOOKASSA_TEST_MODE=true`
- `YOOKASSA_WEBHOOK_SECRET`

**Для Cron:**
- `CRON_SECRET` (любая случайная строка)

**Опционально:**
- `RESEND_API_KEY` (для email)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Шаг 4: Обновите URL

После деплоя получите URL проекта (например: `your-project.vercel.app`)

1. Обновите `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`
2. Настройте webhooks:
   - Stripe: `https://your-project.vercel.app/api/webhooks/stripe`
   - YooKassa: `https://your-project.vercel.app/api/payments/yookassa/webhook`
3. Пересоберите проект (Redeploy)

### Шаг 5: Готово! 🎉

Ваш проект доступен по адресу: `https://your-project.vercel.app`

## Через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Деплой
vercel

# Продакшн
vercel --prod
```

## После деплоя

1. ✅ Проверьте главную страницу
2. ✅ Создайте тестовый аккаунт
3. ✅ Проверьте создание конкурента
4. ✅ Проверьте создание продукта
5. ✅ Настройте webhooks в Stripe и YooKassa
6. ✅ Настройте Telegram Mini App в @BotFather

Подробная инструкция: см. `DEPLOY.md`
