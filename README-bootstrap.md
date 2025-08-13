# Bootstrap (Local/CI)
1) Enable package managers
   - `corepack enable`
   - `nvm use || nvm install`
2) Install
   - `pnpm install`
3) Static checks
   - `pnpm typecheck`
   - `pnpm lint`
4) Build
   - `CI=1 pnpm build`
5) QA smoke (adjust BASE_URL)
   - `BASE_URL="http://localhost:3000" MAINTENANCE=1 MOCK_MODE=1 QA_BYPASS_AUTH=1 pnpm qa:smoke`

> Never add dependencies like `node:child_process` — those are Node built-ins.
