const REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'BASE_URL'
] as const;

type Env = Record<(typeof REQUIRED)[number], string> & { QA_BYPASS_AUTH: boolean };

export function loadEnv(): Env {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  return {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    BASE_URL: process.env.BASE_URL!,
    QA_BYPASS_AUTH: process.env.QA_BYPASS_AUTH === '1'
  };
}
