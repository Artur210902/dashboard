# Инструкция по развертыванию на Vercel

## Подготовка к деплою

### 1. Убедитесь, что проект готов

- Все зависимости установлены (`npm install`)
- Проект собирается без ошибок (`npm run build`)
- Все миграции БД применены в Supabase

### 2. Подготовьте переменные окружения

Создайте список всех переменных окружения, которые нужно добавить в Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_BASIC_PRICE_ID=your_basic_price_id
STRIPE_PRO_PRICE_ID=your_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=your_enterprise_price_id

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Telegram Mini App
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# YooKassa (для российских карт)
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key
YOOKASSA_TEST_MODE=true
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Cron (для Vercel Cron)
CRON_SECRET=your_random_secret
```

## Развертывание через Vercel CLI

### 1. Установите Vercel CLI

```bash
npm i -g vercel
```

### 2. Войдите в аккаунт Vercel

```bash
vercel login
```

### 3. Разверните проект

```bash
# Первый деплой (выберите настройки)
vercel

# Продакшн деплой
vercel --prod
```

## Развертывание через веб-интерфейс Vercel

### 1. Подготовьте репозиторий

1. Создайте репозиторий на GitHub/GitLab/Bitbucket
2. Закоммитьте и запушьте код:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Подключите проект к Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "Add New Project"
3. Импортируйте ваш репозиторий
4. Vercel автоматически определит Next.js проект

### 3. Настройте переменные окружения

1. В настройках проекта перейдите в "Environment Variables"
2. Добавьте все переменные из списка выше
3. Убедитесь, что они добавлены для всех окружений (Production, Preview, Development)

### 4. Настройте домен

1. В настройках проекта перейдите в "Domains"
2. Добавьте ваш домен (если есть)
3. Или используйте домен Vercel: `your-project.vercel.app`

### 5. Обновите URL в переменных окружения

После получения URL проекта обновите:
- `NEXT_PUBLIC_APP_URL` - URL вашего проекта на Vercel
- Webhook URLs в Stripe: `https://your-project.vercel.app/api/webhooks/stripe`
- Webhook URLs в YooKassa: `https://your-project.vercel.app/api/payments/yookassa/webhook`

### 6. Настройте Cron Jobs

Cron job для автоматического скрапинга уже настроен в `vercel.json`. После деплоя он будет работать автоматически.

**Важно**: Убедитесь, что в переменных окружения добавлен `CRON_SECRET` для защиты cron endpoint.

## Настройка Webhooks

### Stripe Webhook

1. Откройте [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Добавьте endpoint: `https://your-project.vercel.app/api/webhooks/stripe`
3. Добавьте события:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Скопируйте Webhook Signing Secret в переменную `STRIPE_WEBHOOK_SECRET`

### YooKassa Webhook

1. Откройте [YooKassa Dashboard](https://yookassa.ru/my)
2. Перейдите в настройки магазина
3. Добавьте URL: `https://your-project.vercel.app/api/payments/yookassa/webhook`
4. Включите события:
   - `payment.succeeded`
   - `payment.canceled`
5. Сохраните Webhook Secret в переменную `YOOKASSA_WEBHOOK_SECRET`

## Настройка Telegram Mini App

1. Откройте [@BotFather](https://t.me/BotFather)
2. Используйте команду `/newapp` или `/editapp`
3. Укажите URL вашего приложения: `https://your-project.vercel.app`
4. Сохраните полученный URL Mini App

## Проверка после деплоя

1. ✅ Откройте главную страницу - должна быть редирект на `/login`
2. ✅ Проверьте авторизацию - создайте аккаунт и войдите
3. ✅ Проверьте дашборд - должен отображаться интерфейс
4. ✅ Проверьте создание конкурента - добавьте тестового конкурента
5. ✅ Проверьте создание продукта - добавьте тестовый продукт
6. ✅ Проверьте оплату - попробуйте создать подписку (тестовый режим)
7. ✅ Проверьте Telegram Mini App - откройте через бота

## Мониторинг и логи

### Просмотр логов

```bash
# Через CLI
vercel logs

# Или через веб-интерфейс
# Vercel Dashboard -> Your Project -> Deployments -> View Function Logs
```

### Мониторинг производительности

1. Vercel Dashboard -> Analytics
2. Отслеживайте:
   - Время ответа API
   - Количество запросов
   - Ошибки

## Обновление проекта

После изменений в коде:

```bash
# Закоммитьте изменения
git add .
git commit -m "Your changes"
git push

# Vercel автоматически задеплоит изменения
# Или вручную через CLI:
vercel --prod
```

## Troubleshooting

### Ошибка сборки

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все зависимости в `package.json`
3. Проверьте, что TypeScript компилируется без ошибок

### Ошибки переменных окружения

1. Убедитесь, что все переменные добавлены в Vercel
2. Проверьте, что они доступны для нужного окружения
3. Пересоберите проект после добавления переменных

### Cron job не работает

1. Убедитесь, что `CRON_SECRET` установлен
2. Проверьте логи cron job в Vercel Dashboard
3. Убедитесь, что endpoint `/api/cron/scrape` доступен

### Webhook не работает

1. Проверьте URL webhook в настройках Stripe/YooKassa
2. Убедитесь, что endpoint доступен публично
3. Проверьте логи в Vercel Dashboard

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
