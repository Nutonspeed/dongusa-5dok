import type { User } from '@supabase/supabase-js';
export type AppUser = User & { full_name?: string };
