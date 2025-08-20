// @ts-nocheck
// Promote a user to admin by email using Supabase Service Role
// Usage:
//   TARGET_EMAIL="user@example.com" npx tsx scripts/promote-admin.ts
//   npx tsx scripts/promote-admin.ts user@example.com

import { createClient } from "@supabase/supabase-js"

type PromoteResult = {
  ok: boolean
  email: string
  userId?: string
  previousRole?: string | null
  newRole?: string
  details?: any
  error?: string
}

async function main(): Promise<void> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const TARGET_EMAIL = process.env.TARGET_EMAIL || process.argv[2] || "nuttapong161@gmail.com"

  if (!SUPABASE_URL || !SERVICE_KEY) {
    const res: PromoteResult = {
      ok: false,
      email: TARGET_EMAIL,
      error:
        "Missing Supabase config. Require SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.",
    }
    console.error(JSON.stringify(res, null, 2))
    process.exit(1)
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY)

  const result: PromoteResult = {
    ok: false,
    email: TARGET_EMAIL,
  }

  try {
    // 1) Try to find existing profile by email
    const { data: existingProfile, error: profileLookupError } = await adminClient
      .from("profiles")
      .select("id, email, role")
      .eq("email", TARGET_EMAIL)
      .single()

    let userId: string | null = null
    let previousRole: string | null = null

    if (existingProfile?.id) {
      userId = existingProfile.id
      previousRole = existingProfile.role ?? null
    } else {
      // 2) If profile not found, search Supabase Auth Admin for user id by email
      // listUsers doesn't support direct email filter; we iterate first few pages safely
      let page = 1
      const perPage = 200
      let found = null

      // Iterate up to 5 pages to avoid abuse
      for (page = 1; page <= 5; page++) {
        const { data, error } = await (adminClient as any).auth.admin.listUsers({ page, perPage })
        if (error) {
          throw new Error(`Auth admin listUsers failed: ${error.message || error}`)
        }
        const users = data?.users || data?.data || []
        found = users.find((u: any) => u?.email?.toLowerCase() === TARGET_EMAIL.toLowerCase())
        if (found) break
        if (!users.length) break
      }

      if (!found) {
        throw new Error(
          `User not found in profiles or auth for email ${TARGET_EMAIL}. Ask user to sign in once to create profile.`,
        )
      }

      userId = found.id
      previousRole = null
    }

    if (!userId) {
      throw new Error("Cannot determine userId for target email")
    }

    // 3) Upsert profile with role=admin
    const { error: upsertError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: TARGET_EMAIL,
          role: "admin",
        },
        { onConflict: "id" },
      )
      .select("id")
      .single()

    if (upsertError) {
      throw new Error(`Upsert profile failed: ${upsertError.message}`)
    }

    // 4) Also set user_metadata.role = 'admin' (not used by RLS but helpful in apps)
    const { error: metaError } = await (adminClient as any).auth.admin.updateUserById(userId, {
      user_metadata: { role: "admin" },
    })
    if (metaError) {
      // Not fatal; continue
      console.warn("[warn] Failed to update user_metadata.role:", metaError.message || metaError)
    }

    // 5) Verify
    const { data: verify, error: verifyError } = await adminClient
      .from("profiles")
      .select("email, role")
      .eq("id", userId)
      .single()

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`)
    }

    result.ok = verify?.role === "admin"
    result.userId = userId
    result.previousRole = previousRole
    result.newRole = verify?.role
    result.details = { verify }

    const out = JSON.stringify(result, null, 2)
    if (result.ok) {
      console.log(out)
      process.exit(0)
    } else {
      console.error(out)
      process.exit(2)
    }
  } catch (e: any) {
    result.error = e?.message || String(e)
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2))
  process.exit(1)
})
