import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client for development if credentials are missing
const isDevelopment = import.meta.env.DEV;

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'dummy-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    db: {
      schema: 'public'
    }
  }
);

// Test connection only in production
if (!isDevelopment) {
  supabase.from('crypto_data').select('count', { count: 'exact', head: true })
    .then(() => {
      console.log('Successfully connected to Supabase');
    })
    .then(() => {
      // Chain another then instead of using catch
      // This avoids the TypeScript error with catch
    }, (error: any) => {
      console.error('Failed to connect to Supabase:', error.message);
    });
}
