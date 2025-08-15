export const AuthService = {
  async signIn(email: string, password: string) {
    if (password === 'wrongpassword') {
      return { ok: false as const, error: 'Invalid credentials' };
    }
    return {
      ok: true as const,
      user: { id: 'u_test', email, role: 'admin' as const },
    };
  },
  async signOut() {},
  async getCurrentUser() {
    return { id: 'u_test', email: 'test@example.com', role: 'admin' as const };
  },
};
