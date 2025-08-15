import { describe, it, expect } from 'vitest';
import { AuthService } from '@/lib/services/auth';

describe('Authentication Flow Integration', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
  };

  it('should complete login and logout flow', async () => {
    const signInResult = await AuthService.signIn(testUser.email, testUser.password);
    expect(signInResult.ok).toBe(true);
    expect(signInResult.user?.email).toBe(testUser.email);

    await AuthService.signOut();
  });

  it('should handle invalid credentials properly', async () => {
    const result = await AuthService.signIn('invalid@email.com', 'wrongpassword');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
