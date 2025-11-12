-- Schema para EcomLytics

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de integrações
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'google_ads', 'shopify'
  credentials JSONB, -- Armazena tokens e dados de autenticação
  store_url TEXT, -- Para Shopify
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, integration_type)
);

-- Tabela de planos anuais
CREATE TABLE IF NOT EXISTS public.annual_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  active_scenario TEXT DEFAULT 'Base',
  status TEXT DEFAULT 'rascunho', -- 'rascunho', 'aprovado'
  version INTEGER DEFAULT 1,
  effective_from TEXT,
  scenarios JSONB NOT NULL, -- Armazena todos os cenários
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, version)
);

-- Tabela de metas de planejamento
CREATE TABLE IF NOT EXISTS public.planning_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  revenue_goal DECIMAL(12,2),
  conversion_rate DECIMAL(5,2),
  avg_ticket DECIMAL(10,2),
  avg_product_cost DECIMAL(10,2),
  checkout_fee DECIMAL(5,2),
  payment_gateway_fee DECIMAL(5,2),
  tax_rate DECIMAL(5,2),
  marketing_spend_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dados diários (actuals)
CREATE TABLE IF NOT EXISTS public.daily_actuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(12,2),
  orders INTEGER,
  products JSONB, -- Array de produtos vendidos
  new_customers INTEGER,
  returning_customer_revenue DECIMAL(12,2),
  returning_customer_orders INTEGER,
  payment_breakdown JSONB,
  shipments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabela de métricas do Google Ads
CREATE TABLE IF NOT EXISTS public.google_ads_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  impressions INTEGER,
  clicks INTEGER,
  cost DECIMAL(12,2),
  conversions INTEGER,
  conversion_value DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, campaign_id)
);

-- Tabela de produtos Shopify
CREATE TABLE IF NOT EXISTS public.shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  title TEXT,
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  inventory_quantity INTEGER,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shopify_product_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para integrations
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para annual_plans
CREATE POLICY "Users can view own plans" ON public.annual_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON public.annual_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.annual_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON public.annual_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para planning_goals
CREATE POLICY "Users can view own goals" ON public.planning_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.planning_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.planning_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para daily_actuals
CREATE POLICY "Users can view own actuals" ON public.daily_actuals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actuals" ON public.daily_actuals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actuals" ON public.daily_actuals
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para google_ads_metrics
CREATE POLICY "Users can view own metrics" ON public.google_ads_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.google_ads_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para shopify_products
CREATE POLICY "Users can view own products" ON public.shopify_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.shopify_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.shopify_products
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.annual_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.planning_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.daily_actuals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.shopify_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
