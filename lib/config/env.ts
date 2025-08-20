// DO NOT remove or restructure UI; data wiring only

const REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  // SMTP no longer required; can run in mock/disabled mode
  'BASE_URL',
] as const;

type Env = Record<(typeof REQUIRED)[number], string> & {
  // Email (optional)
  SMTP_HOST?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_FROM_NAME?: string;
  SMTP_FROM_EMAIL?: string;

  // Notification toggles
  NOTIFICATIONS_EMAIL_ENABLED: boolean;
  NOTIFICATIONS_SMS_ENABLED: boolean;

  // SMS (optional)
  SMS_PROVIDER?: string; // e.g., 'thaibulksms' | 'smsmkt' | 'mock'
  SMS_API_KEY?: string;
  SMS_API_SECRET?: string;
  SMS_SENDER_ID?: string;
  SMS_TEST_PHONE?: string; // for /api/notifications/test

  QA_BYPASS_AUTH: boolean;
  missing: string[];
};

export function loadEnv(): Env {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // SMTP optional
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,

    BASE_URL: process.env.BASE_URL || '',

    // Toggles (default email on if SMTP configured later; but explicit flag controls)
    NOTIFICATIONS_EMAIL_ENABLED: process.env.NOTIFICATIONS_EMAIL_ENABLED === '1' || process.env.NOTIFICATIONS_EMAIL_ENABLED === 'true',
    NOTIFICATIONS_SMS_ENABLED: process.env.NOTIFICATIONS_SMS_ENABLED === '1' || process.env.NOTIFICATIONS_SMS_ENABLED === 'true',

    // SMS optional
    SMS_PROVIDER: process.env.SMS_PROVIDER,
    SMS_API_KEY: process.env.SMS_API_KEY,
    SMS_API_SECRET: process.env.SMS_API_SECRET,
    SMS_SENDER_ID: process.env.SMS_SENDER_ID,
    SMS_TEST_PHONE: process.env.SMS_TEST_PHONE,

    QA_BYPASS_AUTH: process.env.QA_BYPASS_AUTH === '1',
    missing,
  };
}
