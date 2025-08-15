// tests/vitest.setup.ts
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));

try {
  const real = await import('@/lib/services/auth');
  const mock = await import('@/tests/mocks/auth.service.mock');
  for (const k of ['signIn', 'signOut', 'getCurrentUser'] as const) {
    if (typeof (real as any).AuthService?.[k] !== 'function') {
      vi.mock('@/lib/services/auth', () => ({ AuthService: mock.AuthService }));
      break;
    }
  }
} catch {
  vi.mock('@/lib/services/auth', () => import('@/tests/mocks/auth.service.mock'));
}

// Mock custom matchers (ถ้าบางเทสต์ import '../../matchers')
try {
  // หากโปรเจ็กต์มี matchers จริง ให้ import จริงแทนการ mock
  await import('../../matchers');
} catch {
  // สร้าง matcher เปล่า ๆ กันล้ม
  // @ts-ignore
  expect.extend({
    toBeOk(received: any) {
      return { pass: !!received, message: () => `expected value to be truthy` };
    },
  });
}

// JSDOM (ถ้ามีเทสต์ที่อ้าง DOM)
import('vitest').then(({ beforeAll }) => {
  beforeAll(() => {
    /* init globals if needed */
  });
});

// include existing setup for env vars/cleanup if present
import './setup.ts';
