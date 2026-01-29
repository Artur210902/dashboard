-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  price_selector TEXT NOT NULL,
  name_selector TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  target_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-Competitor junction table
CREATE TABLE IF NOT EXISTS public.product_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  product_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, competitor_id)
);

-- Price history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'target_reached')),
  threshold DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert logs table
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON public.competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_product_competitors_product_id ON public.product_competitors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_competitors_competitor_id ON public.product_competitors(competitor_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_competitor_id ON public.price_history(competitor_id);
CREATE INDEX IF NOT EXISTS idx_price_history_scraped_at ON public.price_history(scraped_at);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON public.alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_alert_id ON public.alert_logs(alert_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
