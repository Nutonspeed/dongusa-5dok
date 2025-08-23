// NOTE: Data wiring only. DO NOT remove or restructure existing UI.
import { createServerClient } from '@/lib/supabase';

export type AuthUser = { id: string; email?: string | null; role?: 'admin' | 'user' };

export const AuthService = {
  async signIn(
    email: string,
    password: string
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
    if (process.env.QA_BYPASS_AUTH === '1') {
      return { ok: true, user: { id: 'qa-user', email, role: 'admin' } };
    }
  const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, error: error?.message || 'Invalid credentials' };
    }
    return { ok: true, user: { id: data.user.id, email: data.user.email } };
  },

  async signOut(): Promise<void> {
    if (process.env.QA_BYPASS_AUTH === '1') return;
  const supabase = await createServerClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (process.env.QA_BYPASS_AUTH === '1') {
      return { id: 'qa-user', email: 'qa@example.com', role: 'admin' };
    }
  const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email };
  },
} as const;

export default AuthService;
