import { createClient } from "@supabase/supabase-js"

console.log("[v0] Starting user permissions and demo credentials fix...")

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase environment variables")
  console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("[v0] SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey)
} else {
  console.log("[v0] ✅ Supabase environment variables found")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixUserPermissions() {
  console.log("[v0] Checking user permissions for nuttapong161@gmail.com...")

  try {
    // First, check if user exists in profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "nuttapong161@gmail.com")
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error fetching user profile:", fetchError)
      return false
    }

    if (!existingProfile) {
      console.log("[v0] User profile not found, creating admin profile...")

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error("[v0] Error fetching auth users:", authError)
        return false
      }

      const existingAuthUser = authUsers.users.find((user) => user.email === "nuttapong161@gmail.com")

      if (!existingAuthUser) {
        console.log("[v0] ⚠️  User not found in auth.users table")
        console.log("[v0] 💡 User needs to sign up first through the authentication system")
        return false
      }

      // Create admin profile with user_id from auth
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: existingAuthUser.id,
          email: "nuttapong161@gmail.com",
          full_name: "Nuttapong Admin",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating admin profile:", insertError)
        return false
      }

      console.log("[v0] ✅ Admin profile created successfully:", newProfile)
      return true
    } else {
      // Update existing profile to admin
      console.log("[v0] Current user role:", existingProfile.role)

      if (existingProfile.role !== "admin") {
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({
            role: "admin",
            updated_at: new Date().toISOString(),
          })
          .eq("email", "nuttapong161@gmail.com")
          .select()
          .single()

        if (updateError) {
          console.error("[v0] Error updating user role:", updateError)
          return false
        }

        console.log("[v0] ✅ User role updated to admin:", updatedProfile)
        return true
      } else {
        console.log("[v0] ✅ User already has admin role")
        return true
      }
    }
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return false
  }
}

function checkDemoCredentialsVisibility() {
  console.log("[v0] Checking demo credentials visibility...")

  // Check environment variables that control demo visibility
  const nodeEnv = process.env.NODE_ENV || "development"
  const isProduction = nodeEnv === "production"
  const useSupabase = process.env.USE_SUPABASE === "true"
  const nextPublicUseSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"

  console.log("[v0] Environment check:")
  console.log("  NODE_ENV:", nodeEnv)
  console.log("  IS_PRODUCTION:", isProduction)
  console.log("  USE_SUPABASE:", useSupabase)
  console.log("  NEXT_PUBLIC_USE_SUPABASE:", nextPublicUseSupabase)

  if (!isProduction) {
    console.log("[v0] ⚠️  Demo credentials are visible because NODE_ENV is not 'production'")
    console.log("[v0] 💡 To hide demo credentials, set NODE_ENV=production")
    return false
  } else {
    console.log("[v0] ✅ Demo credentials should be hidden in production mode")
    return true
  }
}
;(async function runDiagnostics() {
  console.log("[v0] =================================")
  console.log("[v0] User Permissions & Demo Fix")
  console.log("[v0] =================================")

  // Fix user permissions
  const permissionsFixed = await fixUserPermissions()

  // Check demo credentials visibility
  const demoHidden = checkDemoCredentialsVisibility()

  console.log("[v0] =================================")
  console.log("[v0] Summary:")
  console.log("[v0] =================================")
  console.log(`[v0] User permissions: ${permissionsFixed ? "✅ FIXED" : "❌ FAILED"}`)
  console.log(`[v0] Demo credentials: ${demoHidden ? "✅ HIDDEN" : "⚠️  VISIBLE"}`)

  if (permissionsFixed && demoHidden) {
    console.log("[v0] 🎉 All issues resolved!")
  } else {
    console.log("[v0] ⚠️  Some issues need attention:")
    if (!permissionsFixed) {
      console.log("[v0]   - User permissions could not be updated")
    }
    if (!demoHidden) {
      console.log("[v0]   - Demo credentials are still visible")
      console.log("[v0]   - Set NODE_ENV=production to hide them")
    }
  }

  // Additional recommendations
  console.log("[v0] =================================")
  console.log("[v0] Recommendations:")
  console.log("[v0] =================================")
  console.log("[v0] 1. Verify nuttapong161@gmail.com can access admin dashboard")
  console.log("[v0] 2. Test login with the updated permissions")
  console.log("[v0] 3. Ensure production environment variables are set correctly")
  console.log("[v0] 4. Clear browser cache if demo credentials still appear")
  console.log("[v0] 5. Check that user exists in auth.users table first")
})().catch((error) => {
  console.error("[v0] Script execution failed:", error)
})
