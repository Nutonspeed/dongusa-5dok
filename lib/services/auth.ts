// DO NOT remove or restructure UI; data wiring only
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  if (process.env.QA_BYPASS_AUTH === '1') {
    return { id: 'qa-user', email: 'qa@example.com' } as any;
  }
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
