---
---

name: Add missing environment secrets
about: Checklist for adding required environment variables for CI / Preview

---

---

name: Add missing environment secrets
about: Checklist for adding required environment variables for CI / Preview

---

Please add the following environment variables to the repository or project settings (GitHub Actions secrets or Vercel project variables):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_USE_SUPABASE (set to true for preview environments using real Supabase)

Optional but recommended:

- SUPABASE_SERVICE_ROLE_KEY
- XAI_API_KEY
- BLOB_READ_WRITE_TOKEN
- KV_REST_API_URL
- KV_REST_API_TOKEN

Notes:

- Never commit secrets into the repository. Use the provider's secret store.
- After adding secrets, re-run the failing workflow or push a small commit to trigger CI.
- After adding secrets, re-run the failing workflow or push a small commit to trigger CI.
