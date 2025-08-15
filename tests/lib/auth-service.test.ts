import { describe, it, expect } from 'vitest';
import { AuthService } from '@/lib/services/auth';

describe('AuthService', () => {
  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const result = await AuthService.signIn('test@example.com', 'password');
      expect(result.ok).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should return error for invalid credentials', async () => {
      const result = await AuthService.signIn('test@example.com', 'wrongpassword');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });
});
