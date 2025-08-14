export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  QA_BYPASS_AUTH: process.env.QA_BYPASS_AUTH === '1',
  MOCK_MODE: process.env.MOCK_MODE === '1',
  MAINTENANCE: process.env.MAINTENANCE === '1',
  NEXT_PUBLIC_ADMIN_MODE: process.env.NEXT_PUBLIC_ADMIN_MODE ?? '0',
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    '',
  BASE_URL: process.env.BASE_URL ?? '',
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  HOME_REDIRECT_STRICT: process.env.HOME_REDIRECT_STRICT === '1',
} as const;
