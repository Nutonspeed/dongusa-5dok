# Release Notes

## Highlights

- Dual-mode data layer switching between mock data and Supabase backend via environment configuration.
- Centralized money calculations in `lib/money.ts` for consistent totals.
- Bills flow validated end-to-end including creation, customer view, and status timeline.
- Edge/Node runtime incompatibilities resolved.
- Husky guard prevents accidental deletion in UI directories.
- Release candidate tagging script `pnpm rc:tag` added to support deployments.
- QA smoke script and CSV export endpoint ensure core flows remain healthy.
- DEV_MASTER_PLAN outlines architecture, data modes, and next steps.

- Preview fixed (ENV set on PREVIEW), auto-QA via GitHub Actions
- Prod verified: health/useSupabase:true, admin redirect OK, CSV 200, bills POST OK
