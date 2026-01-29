# Настройка Telegram Mini App

## Шаги настройки

### 1. Создание Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Настройка Mini App

1. Отправьте `/newapp` в [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Укажите название приложения
4. Укажите описание
5. Загрузите иконку (512x512px)
6. Укажите URL вашего приложения: `https://yourdomain.com`
7. Сохраните полученный URL Mini App

### 3. Настройка переменных окружения

Добавьте в `.env.local`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# YooKassa (для российских карт)
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_TEST_MODE=true  # false для продакшена
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Настройка YooKassa

1. Зарегистрируйтесь на [ЮKassa](https://yookassa.ru)
2. Создайте магазин
3. Получите Shop ID и Secret Key
4. Настройте webhook URL: `https://yourdomain.com/api/payments/yookassa/webhook`
5. Включите события: `payment.succeeded`, `payment.canceled`

### 5. Обновление тарифов для рублей

В файле `lib/stripe/subscriptions.ts` цены указаны в евро. Для российского рынка можно добавить поддержку рублей:

```typescript
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 3000, // 3000₽ вместо 30€
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    // ...
  },
  // ...
}
```

### 6. Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку Mini App (если настроена)
3. Или перейдите по прямой ссылке: `https://t.me/your_bot/your_app`
4. Проверьте авторизацию через Telegram
5. Протестируйте оплату через ЮKassa

## Особенности Telegram Mini App

- Приложение автоматически определяет, что оно запущено в Telegram
- Используется Telegram Web App SDK для нативного интерфейса
- Авторизация происходит автоматически через Telegram
- Оплата через ЮKassa поддерживает российские карты
- Интерфейс адаптируется под тему Telegram

## Безопасность

- Все данные Telegram проверяются через HMAC-SHA256
- Webhook от ЮKassa проверяется через подпись
- Пользователи создаются в Supabase с привязкой к Telegram ID
