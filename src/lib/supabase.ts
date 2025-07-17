import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MonthlyData = {
  id: string;
  month: number;
  year: number;
  goal: number;
  total_sales: number;
  direct_sales: number;
  ota_sales: number;
  central_sales: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};