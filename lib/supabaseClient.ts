import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos do banco de dados
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Integration {
  id: string;
  user_id: string;
  integration_type: 'google_ads' | 'shopify';
  credentials?: any;
  store_url?: string;
  is_active: boolean;
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualPlanDB {
  id: string;
  user_id: string;
  year: number;
  active_scenario: string;
  status: string;
  version: number;
  effective_from?: string;
  scenarios: any;
  created_at?: string;
  updated_at?: string;
}

export interface PlanningGoal {
  id?: string;
  user_id: string;
  revenue_goal: number;
  conversion_rate: number;
  avg_ticket: number;
  avg_product_cost: number;
  checkout_fee: number;
  payment_gateway_fee: number;
  tax_rate: number;
  marketing_spend_percentage: number;
  created_at?: string;
  updated_at?: string;
}
