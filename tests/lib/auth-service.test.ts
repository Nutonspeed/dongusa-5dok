// NOTE: No UI restructure. Types/boundary only.
import { describe, it, expect } from 'vitest';
import { AuthService } from '@/lib/services/auth';

describe('AuthService', () => {
  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const result = await AuthService.signIn('test@example.com', 'password');
      if (result.ok) {
        expect(result.user.email).toBe('test@example.com');
      } else {
        expect(result.error).toBeUndefined();
      }
    });

    it('should return error for invalid credentials', async () => {
      const result = await AuthService.signIn('test@example.com', 'wrongpassword');
      if (!result.ok) {
        expect(result.error).toBe('Invalid credentials');
      } else {
        expect(result.user).toBeUndefined();
      }
    });
  });
});
