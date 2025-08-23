# Environment setup for dongusa-5dok

Local development

Copy `.env.example` to `.env.local` at the project root. Fill the required values (at minimum: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). Do NOT commit `.env.local` to the repo.

CI / Preview / Production

Add the same environment variables (the real secrets) to your hosting provider or GitHub Actions secrets. For example: GitHub Actions -> Repository Settings -> Secrets -> Actions, or Vercel -> Project Settings -> Environment Variables. Required values for CI/preview: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_USE_SUPABASE.

Node version

This project supports Node 18.x - 20.x. The repository includes `scripts/check-node-version.js` which runs on `prebuild` and fails fast if an unsupported Node is used. Use nvm or nvm-windows to switch Node versions.

Quick local test

Install dependencies: `pnpm install`.
Run the health-check: `pnpm exec tsx scripts/website-health-check.ts`.
Build: `pnpm run build` (only after Node and envs are set).

If you want me to add a GitHub Actions secret template or help populate CI with safe test tokens, tell me and I'll prepare it.
