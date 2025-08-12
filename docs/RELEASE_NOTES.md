# Release Notes

## Highlights

- Dual-mode data layer switching between mock data and Supabase backend via environment configuration.
- Centralized money calculations in `lib/money.ts` for consistent totals.
- Bills flow validated end-to-end including creation, customer view, and status timeline.
- Edge/Node runtime incompatibilities resolved.
- Husky guard prevents accidental deletion in UI directories.
- Release candidate tagging script `pnpm rc:tag` added to support deployments.
