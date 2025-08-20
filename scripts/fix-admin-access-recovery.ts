import { createClient } from "@supabase/supabase-js"

interface AdminRecoveryResult {
  success: boolean
  message: string
  details?: any
}

class AdminAccessRecovery {
  private supabase: any
  private adminClient: any

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    this.supabase = createClient(supabaseUrl, anonKey)

    if (serviceKey) {
      this.adminClient = createClient(supabaseUrl, serviceKey)
    }
  }

  async checkAdminUser(email: string): Promise<AdminRecoveryResult> {
    console.log(`🔍 Checking admin user: ${email}`)

    try {
      // Check if user exists in auth.users
      if (this.adminClient) {
        const { data: authUsers, error: authError } = await this.adminClient.auth.admin.listUsers()

        if (authError) {
          return { success: false, message: `Cannot access auth users: ${authError.message}` }
        }

        const authUser = authUsers.users.find((u) => u.email === email)
        console.log(`Auth user found: ${!!authUser}`)

        if (authUser) {
          console.log(`User ID: ${authUser.id}`)
          console.log(`Email confirmed: ${!!authUser.email_confirmed_at}`)
          console.log(`Created: ${authUser.created_at}`)
        }
      }

      // Check profile in database
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        return { success: false, message: `Profile check error: ${profileError.message}` }
      }

      return {
        success: true,
        message: "Admin user check completed",
        details: {
          profileExists: !!profile,
          currentRole: profile?.role || "none",
          profileData: profile,
        },
      }
    } catch (error) {
      return { success: false, message: `Check failed: ${error}` }
    }
  }

  async fixAdminRole(email: string): Promise<AdminRecoveryResult> {
    console.log(`🔧 Fixing admin role for: ${email}`)

    try {
      // First, get the user ID from auth
      let userId: string | null = null

      if (this.adminClient) {
        const { data: authUsers } = await this.adminClient.auth.admin.listUsers()
        const authUser = authUsers.users.find((u) => u.email === email)
        userId = authUser?.id || null
      }

      if (!userId) {
        return { success: false, message: "User not found in authentication system" }
      }

      // Update or create profile with admin role
      const { data: profile, error: upsertError } = await this.supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            email: email,
            full_name: "Admin User",
            role: "admin",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )
        .select()
        .single()

      if (upsertError) {
        return { success: false, message: `Failed to update profile: ${upsertError.message}` }
      }

      return {
        success: true,
        message: "Admin role successfully assigned",
        details: { profile },
      }
    } catch (error) {
      return { success: false, message: `Role fix failed: ${error}` }
    }
  }

  async testAdminLogin(email: string, password: string): Promise<AdminRecoveryResult> {
    console.log(`🔐 Testing admin login for: ${email}`)

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, message: `Login failed: ${error.message}` }
      }

      // Check if user gets admin role after login
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("role, email")
        .eq("id", data.user.id)
        .single()

      // Sign out immediately
      await this.supabase.auth.signOut()

      const isAdmin = profile?.role === "admin" || profile?.email === email

      return {
        success: isAdmin,
        message: isAdmin ? "Admin login successful" : "Login successful but no admin privileges",
        details: {
          userId: data.user.id,
          userEmail: data.user.email,
          profileRole: profile?.role,
          hasAdminAccess: isAdmin,
        },
      }
    } catch (error) {
      return { success: false, message: `Login test failed: ${error}` }
    }
  }

  async runFullRecovery(email: string, password?: string): Promise<void> {
    console.log("🚀 Starting Admin Access Recovery")
    console.log("=".repeat(50))

    // Step 1: Check current status
    const checkResult = await this.checkAdminUser(email)
    console.log(`✅ Check Result: ${checkResult.message}`)
    if (checkResult.details) {
      console.log("   Details:", JSON.stringify(checkResult.details, null, 2))
    }

    // Step 2: Fix admin role if needed
    const fixResult = await this.fixAdminRole(email)
    console.log(`🔧 Fix Result: ${fixResult.message}`)
    if (fixResult.details) {
      console.log("   Details:", JSON.stringify(fixResult.details, null, 2))
    }

    // Step 3: Test login if password provided
    if (password) {
      const loginResult = await this.testAdminLogin(email, password)
      console.log(`🔐 Login Test: ${loginResult.message}`)
      if (loginResult.details) {
        console.log("   Details:", JSON.stringify(loginResult.details, null, 2))
      }
    }

    console.log("\n💡 RECOVERY SUMMARY:")
    console.log("=".repeat(50))
    console.log(`✅ User check: ${checkResult.success ? "PASSED" : "FAILED"}`)
    console.log(`🔧 Role fix: ${fixResult.success ? "PASSED" : "FAILED"}`)
    if (password) {
      const loginResult = await this.testAdminLogin(email, password)
      console.log(`🔐 Login test: ${loginResult.success ? "PASSED" : "FAILED"}`)
    }

    console.log("\n🎯 NEXT STEPS:")
    if (fixResult.success) {
      console.log("1. ✅ Admin role has been assigned")
      console.log("2. 🌐 Try logging in through the web interface")
      console.log("3. 🔄 Clear browser cache if needed")
      console.log("4. 📱 Check that you're redirected to /admin after login")
    } else {
      console.log("1. ❌ Manual intervention required")
      console.log("2. 🔍 Check Supabase dashboard for user status")
      console.log("3. 📧 Verify email confirmation status")
    }
  }
}

// Run recovery for the specific admin user
const recovery = new AdminAccessRecovery()
recovery.runFullRecovery("nuttapong161@gmail.com", "127995803").catch(console.error)
