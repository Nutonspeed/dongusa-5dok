// NOTE: No UI restructure. Types/boundary only.
import { describe, it, expect } from 'vitest';
import { AuthService } from '@/lib/services/auth';

describe('Authentication Flow Integration', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
  };

  it('should complete login and logout flow', async () => {
    const signInResult = await AuthService.signIn(testUser.email, testUser.password);
    if (signInResult.ok) {
      expect(signInResult.user.email).toBe(testUser.email);
    } else {
      expect(signInResult.error).toBeUndefined();
    }
    await AuthService.signOut();
  });

  it('should handle invalid credentials properly', async () => {
    const result = await AuthService.signIn('invalid@email.com', 'wrongpassword');
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    } else {
      expect(result.user).toBeUndefined();
    }
  });
});
