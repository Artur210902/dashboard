# Competitor Price Tracking Dashboard

Дашборд для автоматического отслеживания цен конкурентов с системой подписок и уведомлений.

## Возможности

- 🔐 Аутентификация через Supabase Auth
- 💳 Система подписок через Stripe (Basic 30€, Pro 50€, Enterprise 80€)
- 🕷️ Автоматический веб-скрапинг цен конкурентов
- 📊 Визуализация данных с графиками (Recharts)
- 🔔 Система алертов с email уведомлениями
- 📈 История изменения цен
- 🎯 Управление конкурентами и продуктами

## Технологический стек

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Scraping**: Cheerio
- **Deployment**: Vercel

## Установка

### 1. Клонирование и установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.local.example`:

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
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (для Vercel Cron)
CRON_SECRET=your_random_secret
```

### 3. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Выполните миграции из папки `supabase/migrations/`:
   - `001_initial_schema.sql` - создание таблиц
   - `002_rls_policies.sql` - настройка Row Level Security
   - `003_user_creation_trigger.sql` - триггер для создания профиля пользователя

3. В настройках Supabase включите Email Auth

### 4. Настройка Stripe

1. Создайте аккаунт в [Stripe](https://stripe.com)
2. Создайте три продукта с ценами:
   - Basic: 30€/месяц
   - Pro: 50€/месяц
   - Enterprise: 80€/месяц
3. Скопируйте Price IDs в переменные окружения
4. Настройте webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Добавьте события: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Настройка Resend

1. Создайте аккаунт в [Resend](https://resend.com)
2. Получите API ключ
3. Добавьте домен для отправки email

### 6. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Страницы аутентификации
│   ├── (dashboard)/              # Защищенные страницы
│   ├── api/                      # API routes
│   └── layout.tsx
├── components/                   # React компоненты
│   ├── ui/                       # Shadcn/ui компоненты
│   └── dashboard/                # Компоненты дашборда
├── lib/                          # Утилиты
│   ├── supabase/                 # Supabase клиенты
│   ├── stripe/                   # Stripe интеграция
│   ├── scraper/                  # Логика скрапинга
│   ├── alerts/                   # Система алертов
│   └── email/                    # Email сервис
├── supabase/                     # Миграции БД
│   └── migrations/
└── types/                        # TypeScript типы
```

## Использование

### Добавление конкурента

1. Перейдите в раздел "Конкуренты"
2. Нажмите "Добавить конкурента"
3. Заполните:
   - Название
   - URL сайта
   - CSS селектор для цены (например: `.price`, `#price`, `[data-price]`)
   - CSS селектор для названия продукта (опционально)

### Добавление продукта

1. Перейдите в раздел "Продукты"
2. Нажмите "Добавить продукт"
3. Заполните название, SKU (опционально) и целевую цену
4. Привяжите продукт к конкурентам, указав URL продукта у каждого конкурента

### Настройка алертов

1. Перейдите в раздел "Алерты"
2. Создайте алерт с условиями:
   - Падение цены
   - Рост цены
   - Достижение целевой цены
3. Укажите порог изменения (опционально)
4. Выберите продукт и/или конкурента (или оставьте для всех)

### Автоматический скрапинг

Скрапинг запускается автоматически через Vercel Cron каждые 6 часов. Также можно запустить вручную через API endpoint `/api/scrape/batch`.

## Развертывание

### Vercel

**Быстрый старт:**
1. Подготовьте репозиторий на GitHub/GitLab/Bitbucket
2. Откройте [Vercel](https://vercel.com/new) и импортируйте репозиторий
3. Добавьте все переменные окружения (см. `QUICK_DEPLOY.md`)
4. Деплой произойдет автоматически!

**Подробная инструкция:** см. `DEPLOY.md` или `QUICK_DEPLOY.md`

**Важно после деплоя:**
- Обновите `NEXT_PUBLIC_APP_URL` на URL вашего проекта
- Настройте webhooks в Stripe и YooKassa
- Настройте Telegram Mini App в @BotFather

## Ограничения по тарифам

- **Basic (30€/мес)**: 5 конкурентов, 20 продуктов, 10 алертов
- **Pro (50€/мес)**: 15 конкурентов, 100 продуктов, 50 алертов
- **Enterprise (80€/мес)**: Безлимитные конкуренты, продукты и алерты

## Безопасность

- Row Level Security (RLS) в Supabase для защиты данных
- Middleware для защиты маршрутов
- Валидация данных на клиенте и сервере
- Secure API keys management

## Лицензия

MIT
