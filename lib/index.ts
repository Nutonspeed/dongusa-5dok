// Re-export everything from supabase client
export * from './supabase/client';

// Re-export server-side supabase if needed on the client
import { createClient as createServerClient } from './supabase/server';
export { createServerClient };

// Re-export utilities
export * from './utils/formatPrice';

// Types
export type { Database } from '@/types/database';
