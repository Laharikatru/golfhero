-- ============================================================
-- GolfHero Platform — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_id TEXT, -- Stripe subscription ID
  customer_id TEXT,     -- Stripe customer ID
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  charity_id UUID,
  charity_contribution_pct DECIMAL(5,2) DEFAULT 10.00,
  total_winnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHARITIES
-- ============================================================
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  website_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_raised DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charity events (golf days etc.)
CREATE TABLE public.charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOLF SCORES
-- ============================================================
CREATE TABLE public.golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date) -- One score per user per date
);

-- ============================================================
-- DRAWS
-- ============================================================
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
  draw_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'simulation', 'published', 'completed')),
  draw_type TEXT NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  -- The 5 drawn numbers
  number_1 INTEGER,
  number_2 INTEGER,
  number_3 INTEGER,
  number_4 INTEGER,
  number_5 INTEGER,
  -- Prize pools (calculated at draw time)
  total_pool DECIMAL(10,2) DEFAULT 0.00,
  pool_5match DECIMAL(10,2) DEFAULT 0.00,
  pool_4match DECIMAL(10,2) DEFAULT 0.00,
  pool_3match DECIMAL(10,2) DEFAULT 0.00,
  jackpot_rollover DECIMAL(10,2) DEFAULT 0.00,
  -- Participants
  participant_count INTEGER DEFAULT 0,
  -- Meta
  notes TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_month, draw_year)
);

-- Draw results per user
CREATE TABLE public.draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- User's scores at time of draw (snapshot)
  user_scores INTEGER[] NOT NULL,
  -- Match details
  match_count INTEGER NOT NULL DEFAULT 0 CHECK (match_count >= 0 AND match_count <= 5),
  matched_numbers INTEGER[],
  -- Prize
  prize_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid', 'rejected')),
  proof_url TEXT,
  proof_submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- ============================================================
-- PAYMENTS / SUBSCRIPTIONS LOG
-- ============================================================
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'gbp',
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHARITY CONTRIBUTIONS LOG
-- ============================================================
CREATE TABLE public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  contribution_pct DECIMAL(5,2) NOT NULL,
  subscription_amount DECIMAL(10,2) NOT NULL,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRIZE POOL CONFIG
-- ============================================================
CREATE TABLE public.prize_pool_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_plan_amount DECIMAL(10,2) DEFAULT 9.99,
  yearly_plan_amount DECIMAL(10,2) DEFAULT 99.99,
  pool_contribution_pct DECIMAL(5,2) DEFAULT 40.00, -- 40% of sub goes to prize pool
  charity_min_pct DECIMAL(5,2) DEFAULT 10.00,
  match5_pct DECIMAL(5,2) DEFAULT 40.00,
  match4_pct DECIMAL(5,2) DEFAULT 35.00,
  match3_pct DECIMAL(5,2) DEFAULT 25.00,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO public.prize_pool_config (id) VALUES (uuid_generate_v4());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_golf_scores_user_id ON public.golf_scores(user_id);
CREATE INDEX idx_golf_scores_score_date ON public.golf_scores(score_date);
CREATE INDEX idx_draw_results_draw_id ON public.draw_results(draw_id);
CREATE INDEX idx_draw_results_user_id ON public.draw_results(user_id);
CREATE INDEX idx_draw_results_match_count ON public.draw_results(match_count);
CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_charities_is_active ON public.charities(is_active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool_config ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own, admins see all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Golf scores: users manage their own
CREATE POLICY "scores_select_own" ON public.golf_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scores_insert_own" ON public.golf_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scores_update_own" ON public.golf_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scores_delete_own" ON public.golf_scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "scores_admin_all" ON public.golf_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draws: public read for published, admin full control
CREATE POLICY "draws_public_read" ON public.draws FOR SELECT USING (status IN ('published', 'completed'));
CREATE POLICY "draws_admin_all" ON public.draws FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draw results: users see their own
CREATE POLICY "draw_results_own" ON public.draw_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "draw_results_update_own" ON public.draw_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "draw_results_admin_all" ON public.draw_results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charities: public read for active
CREATE POLICY "charities_public_read" ON public.charities FOR SELECT USING (is_active = true);
CREATE POLICY "charities_admin_all" ON public.charities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charity events: public read
CREATE POLICY "charity_events_public_read" ON public.charity_events FOR SELECT USING (is_active = true);
CREATE POLICY "charity_events_admin_all" ON public.charity_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Prize pool config: public read
CREATE POLICY "prize_pool_public_read" ON public.prize_pool_config FOR SELECT USING (true);
CREATE POLICY "prize_pool_admin_write" ON public.prize_pool_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Contributions: own + admin
CREATE POLICY "contributions_own" ON public.charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contributions_admin" ON public.charity_contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payment events: own + admin
CREATE POLICY "payment_events_own" ON public.payment_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_events_admin" ON public.payment_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scores_updated_at BEFORE UPDATE ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_draw_results_updated_at BEFORE UPDATE ON public.draw_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA: Charities
-- ============================================================
INSERT INTO public.charities (name, slug, description, short_description, category, is_featured, total_raised) VALUES
('Cancer Research UK', 'cancer-research-uk', 'Cancer Research UK is the world''s leading cancer charity dedicated to saving lives through research. Every donation funds vital research into preventing, diagnosing, and treating cancer.', 'World-leading cancer research saving lives every day', 'Health & Medical', true, 48320.00),
('Macmillan Cancer Support', 'macmillan-cancer-support', 'Macmillan Cancer Support provides medical, emotional, practical, and financial support to people living with cancer. We''re there from the moment of diagnosis.', 'Support for those living with cancer', 'Health & Medical', false, 31200.00),
('RNLI (Royal National Lifeboat Institution)', 'rnli', 'The RNLI saves lives at sea. Our lifeboat crews and lifeguards are on call 24/7, 365 days a year. We are independent from government, funded entirely by donations.', 'Saving lives at sea, 24/7', 'Emergency Services', true, 22150.00),
('WWF UK', 'wwf-uk', 'WWF is one of the world''s leading independent conservation organisations. Our mission is to create a world where people and wildlife can thrive together.', 'Protecting the natural world for future generations', 'Environment', false, 18900.00),
('Comic Relief', 'comic-relief', 'Comic Relief uses the power of entertainment to make a real difference to the lives of people living incredibly tough lives. Every pound donated stays in the UK or goes abroad.', 'Entertainment with a purpose — real change worldwide', 'International Aid', true, 15600.00),
('Age UK', 'age-uk', 'Age UK is the UK''s leading charity dedicated to helping everyone make the most of later life. We provide vital services and campaign for changes that make life better.', 'Championing dignity and opportunity in later life', 'Elderly Care', false, 12800.00);

-- ============================================================
-- FUNCTION: get_user_latest_5_scores
-- ============================================================
CREATE OR REPLACE FUNCTION get_latest_scores(p_user_id UUID)
RETURNS TABLE(id UUID, score INTEGER, score_date DATE, notes TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT gs.id, gs.score, gs.score_date, gs.notes, gs.created_at
  FROM public.golf_scores gs
  WHERE gs.user_id = p_user_id
  ORDER BY gs.score_date DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: enforce 5-score rolling limit
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count
  FROM public.golf_scores WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    -- Delete oldest score
    SELECT id INTO oldest_id
    FROM public.golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date ASC
    LIMIT 1;

    DELETE FROM public.golf_scores WHERE id = oldest_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_score_limit
  BEFORE INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION enforce_score_limit();

-- ============================================================
-- FUNCTION: calculate prize pool for a draw
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_prize_pool(p_draw_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_active_count INTEGER;
  v_config prize_pool_config%ROWTYPE;
  v_monthly_contribution DECIMAL;
  v_total_pool DECIMAL;
  v_prev_jackpot DECIMAL := 0;
  v_result JSONB;
BEGIN
  SELECT * INTO v_config FROM public.prize_pool_config WHERE is_active = true LIMIT 1;
  SELECT COUNT(*) INTO v_active_count FROM public.profiles WHERE subscription_status = 'active';

  -- Average contribution (mix of monthly/yearly — simplified)
  v_monthly_contribution := v_config.monthly_plan_amount * (v_config.pool_contribution_pct / 100);
  v_total_pool := v_monthly_contribution * v_active_count;

  -- Check for rolled-over jackpot from previous month
  SELECT COALESCE(pool_5match, 0) INTO v_prev_jackpot
  FROM public.draws
  WHERE status = 'completed'
    AND NOT EXISTS (SELECT 1 FROM public.draw_results WHERE draw_id = id AND match_count = 5)
  ORDER BY draw_year DESC, draw_month DESC
  LIMIT 1;

  v_result := jsonb_build_object(
    'total_pool', v_total_pool,
    'pool_5match', (v_total_pool * (v_config.match5_pct / 100)) + v_prev_jackpot,
    'pool_4match', v_total_pool * (v_config.match4_pct / 100),
    'pool_3match', v_total_pool * (v_config.match3_pct / 100),
    'participant_count', v_active_count,
    'jackpot_rollover', v_prev_jackpot
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
