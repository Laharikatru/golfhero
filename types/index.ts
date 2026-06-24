export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'subscriber' | 'admin'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
  subscription_plan?: 'monthly' | 'yearly'
  subscription_id?: string
  customer_id?: string
  subscription_start?: string
  subscription_end?: string
  charity_id?: string
  charity_contribution_pct: number
  total_winnings: number
  created_at: string
  updated_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number
  score_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  image_url?: string
  website_url?: string
  category?: string
  is_featured: boolean
  is_active: boolean
  total_raised: number
  created_at: string
  updated_at: string
  events?: CharityEvent[]
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  description?: string
  event_date: string
  location?: string
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface Draw {
  id: string
  draw_month: number
  draw_year: number
  status: 'pending' | 'simulation' | 'published' | 'completed'
  draw_type: 'random' | 'algorithmic'
  number_1?: number
  number_2?: number
  number_3?: number
  number_4?: number
  number_5?: number
  total_pool: number
  pool_5match: number
  pool_4match: number
  pool_3match: number
  jackpot_rollover: number
  participant_count: number
  notes?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  user_scores: number[]
  match_count: number
  matched_numbers: number[]
  prize_amount: number
  payment_status: 'pending' | 'approved' | 'paid' | 'rejected'
  proof_url?: string
  proof_submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
  paid_at?: string
  created_at: string
  updated_at: string
  // joined
  draw?: Draw
  profile?: Profile
}

export interface PrizePoolConfig {
  id: string
  monthly_plan_amount: number
  yearly_plan_amount: number
  pool_contribution_pct: number
  charity_min_pct: number
  match5_pct: number
  match4_pct: number
  match3_pct: number
  is_active: boolean
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  amount: number
  contribution_pct: number
  subscription_amount: number
  period_start?: string
  period_end?: string
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  priceId: string
  savings?: string
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 99.99,
    interval: 'year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '',
    savings: 'Save 17%',
    popular: true,
  },
]

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
