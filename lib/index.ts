// Re-export everything from supabase client
export * from './supabase/client';

// Re-export the guarded createServerClient from the supabase façade so callers go through the mock guard.
export { createServerClient } from './supabase';

// Re-export utilities
export * from './utils/formatPrice';

// Types
export type { Database } from '@/types/database';
