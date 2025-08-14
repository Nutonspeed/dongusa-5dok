import { ENV } from '@/lib/config/env';
import { createClient } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  isQABypass?: boolean;
}

export async function requireAdmin(): Promise<AdminUser> {
  if (ENV.QA_BYPASS_AUTH) {
    return { id: 'qa-admin', email: 'qa@example.com', isQABypass: true };
  }
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    throw new Error('Unauthorized');
  }

  const role =
    (session.user as any).app_metadata?.role ||
    (session.user as any).user_metadata?.role;

  if (role !== 'admin') {
    throw new Error('Unauthorized');
  }

  return { id: session.user.id, email: session.user.email! };
}
