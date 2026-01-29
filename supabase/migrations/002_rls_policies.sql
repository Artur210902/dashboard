-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Competitors policies
CREATE POLICY "Users can view own competitors"
  ON public.competitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitors"
  ON public.competitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitors"
  ON public.competitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitors"
  ON public.competitors FOR DELETE
  USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- Product competitors policies
CREATE POLICY "Users can view own product competitors"
  ON public.product_competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_competitors.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product competitors"
  ON public.product_competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_competitors.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product competitors"
  ON public.product_competitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_competitors.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product competitors"
  ON public.product_competitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_competitors.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Price history policies
CREATE POLICY "Users can view own price history"
  ON public.price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert price history"
  ON public.price_history FOR INSERT
  WITH CHECK (true);

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Alert logs policies
CREATE POLICY "Users can view own alert logs"
  ON public.alert_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alerts
      WHERE alerts.id = alert_logs.alert_id
      AND alerts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert alert logs"
  ON public.alert_logs FOR INSERT
  WITH CHECK (true);
