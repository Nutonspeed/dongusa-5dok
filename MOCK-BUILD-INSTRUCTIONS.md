# Emergency handoff — Get prod build green (mock DB)

Purpose
- Prevent any real DB access and get a reproducible production build green quickly.
- Make only minimal, reversible changes. Mark all temporary edits with `// TEMP` and list them in PR.

Required environment (always set)
- FORCE_MOCK_SUPABASE=1
- DISABLE_WASM_HASH_CACHE=1
- CI=1

How to run (PowerShell, non-interactive)

```powershell
# Preferred (script sets env itself)
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\auto-build.ps1 -maxAttempts 1 -delaySeconds 1

# Or explicit
$env:FORCE_MOCK_SUPABASE='1'; $env:DISABLE_WASM_HASH_CACHE='1'; $env:CI='1'
pnpm -s build
```

What to look for (common quick fixes)
- Type errors referencing `unknown` error: replace with
  ```ts
  const _msg = error instanceof Error ? error.message : String(error)
  ```
- Cached generic mismatch: `return cached as T`
- Export conflict: remove duplicate `export type { X }` when `X` already exported
- Third-party typing mismatch (e.g., cookie options): cast locally `options as any`
- Avoid touching secrets or production connection strings

Optional quick bypass to get green now
- Temporarily skip ESLint during mock build by patching `next.config.js`:

```js
// inside module.exports
eslint: {
  ignoreDuringBuilds: process.env.FORCE_MOCK_SUPABASE === '1'
}
```

- Mark that change `// TEMP: ignore lint during mock build` and include in PR for later revert.

Commit & PR guidance (required)
- Create branch: `hotfix/mock-build`
- Make small commits per file fix. Commit message example:
  ```
  [HOTFIX][TEMP] minimal type guards + mock supabase to allow prod build (FORCE_MOCK_SUPABASE=1)
  ```
- PR title example:
  ```
  [HOTFIX] mock-build: temporary fixes to allow prod build (mock DB)
  ```
- PR body: include
  - Purpose and env flags used
  - Files changed (list)
  - Which edits are TEMP and plan to revert
  - Attach `pnpm -s build` stdout (failing + passing logs) and any screenshots/error snippets
  - Rollback: how to revert commit or set `FORCE_MOCK_SUPABASE=0`

Minimal verification steps (after push)
1. On CI or locally run:
```powershell
$env:FORCE_MOCK_SUPABASE='1'; $env:DISABLE_WASM_HASH_CACHE='1'; $env:CI='1'
pnpm -s build
```
Expect exit code 0.
2. Start dev server with mock env and spot-check 3 pages that usually hit DB (no real DB calls).
3. Add build log to PR.

Safety & notes
- Do NOT commit secrets or .env files.
- Keep TEMP tags and list them in PR; schedule a follow-up cleanup to remove all `as any`/casts and re-enable lint.
- If Edge runtime warnings appear for supabase packages, leave for follow-up unless they block compile.

Quick PR checklist to include when sending to DV
- [ ] Branch created: `hotfix/mock-build`
- [ ] Env flags documented
- [ ] Build logs attached (before + after)
- [ ] All TEMP edits annotated with `// TEMP` and listed in PR body
- [ ] Verification steps documented

PR / Slack message you can send to DV
- Short message to paste:
  ```
  Hi — please apply the hotfix in this branch to get a green prod build quickly. Use mock DB: FORCE_MOCK_SUPABASE=1, DISABLE_WASM_HASH_CACHE=1, CI=1. Fix TypeScript blockers minimally, do not add secrets. Attach build logs to the PR. Mark any // TEMP changes and leave a cleanup PR scheduled after.
  ```

---

If you want me to push the hotfix branch and/or enable the temporary lint bypass and run the build, tell me and I will proceed.
