import { ENV } from '@/lib/config/env';

export interface AdminUser {
  id: string;
  email: string;
  isQABypass?: boolean;
}

export async function requireAdmin(): Promise<AdminUser> {
  if (ENV.QA_BYPASS_AUTH) {
    return { id: 'qa-admin', email: 'qa@example.com', isQABypass: true };
  }
  // TODO: integrate real session check
  throw new Error('Unauthorized');
}
