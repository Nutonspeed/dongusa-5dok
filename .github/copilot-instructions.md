# Copilot Instructions for AI Coding Agents

## Project Overview

- **Platform:** Next.js 14 (App Router, TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth), Upstash Redis, Vercel Blob
- **Payments:** Stripe, PromptPay
- **AI:** xAI (Grok)
- **Deployment:** Vercel

## Architecture & Structure

- `app/`: Next.js app directory (admin, api, auth, shop, etc.)
- `components/`: Reusable UI and system components (organized by domain)
- `lib/`: Utilities, service clients, and integrations
- `scripts/`: DB/deployment/health scripts (see `scripts/website-health-check.ts`)
- `public/`: Static assets
- `mobile-app/`: React Native app (see its own README)

## Key Patterns & Conventions

- **Environment:** All secrets/keys in `.env.local` (see `.env.example`). Production/Preview must set `NEXT_PUBLIC_USE_SUPABASE=true` for real Supabase.
- **API:** Use `/app/api/` for serverless endpoints. Use Supabase client in `lib/` for DB access.
- **Testing:**
  - `pnpm test` for unit/integration
  - `pnpm qa:smoke` for QA smoke tests
  - `pnpm validate:system` for system validation
  - Use `QA_BYPASS_AUTH=1` for mock mode
- **Build/Deploy:**
  - `pnpm build` for production build
  - `pnpm run dev:validate` and `node scripts/website-health-check.ts` for health checks
- **Error Handling:** Log errors with context; check Vercel/Supabase logs for production issues.
- **Component Organization:** Group by domain (e.g., `components/auth/`, `components/fabric/`).
- **Mobile:** See `mobile-app/README.md` for mobile-specific architecture and workflows.

## Integration & Data Flow

- **Supabase:** Used for DB, auth, and some storage. Keys must be valid and project active.
- **Redis (Upstash):** Used for caching (see `lib/` for usage).
- **Vercel Blob:** Used for file storage.
- **Payments:** Stripe and PromptPay integration in both backend and frontend.
- **AI:** xAI integration for select features (see `lib/` and `components/ai/`).

## Troubleshooting & Debugging

- Check Vercel deploy logs for errors (env, build, DB/API failures)
- Validate env vars and Supabase keys
- Use health scripts and validation commands before/after deploy
- Compare `.env.local` and production env for differences

## Examples

- To add a new API route: create a file in `app/api/` and use Supabase client from `lib/`
- To add a new system component: place in `components/{domain}/` and follow existing patterns
- To run full system validation: `pnpm validate:system` or `node scripts/website-health-check.ts`

---

For more, see `README.md`, `mobile-app/README.md`, and scripts in `/scripts`.

---

Additional agent rules (strict):

- When you see imports of `@supabase/supabase-js` or other Node-only libs in files under `app/` (server routes, server components):
  - If the file is an API route or server-only page that must run on Node, add at top-level:
    `export const runtime = "nodejs"`
  - If the file must remain Edge-compatible, convert the import to a local dynamic import within the server function:
    `const { createClient } = await import('@supabase/supabase-js')`
  - Leave a one-line comment explaining the choice.

- CI and local builds must validate critical env vars before running a build. Use `scripts/ci-validate-env.js` (or `npm run ci:validate-env`) in CI workflows.

- Do not commit secrets or change `engines.node` to force a Node version; instead add a prebuild guard like `scripts/check-node-version.js` which already exists.

If uncertain, add `export const runtime = "nodejs"` and explain tradeoffs in the PR.

Signed-off-by: GitHub Copilot
