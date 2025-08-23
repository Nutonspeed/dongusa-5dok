#!/usr/bin/env tsx

/**
 * Test User Signup Script
 * Tests user registration with specific credentials and admin role assignment
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Test user credentials
const TEST_USER = {
  email: "nuttapong161@gmail.com",
  password: "127995803",
  fullName: "Nuttapong Admin User",
  role: "admin" as const,
}

interface TestResult {
  step: string
  success: boolean
  message: string
  data?: any
}

class SignupTester {
  private supabase
  private results: TestResult[] = []

  constructor() {
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  private addResult(step: string, success: boolean, message: string, data?: any) {
    this.results.push({ step, success, message, data })

    if (data) {

    }
  }

  async testUserSignup() {


    // Step 1: Check if user already exists
    await this.checkExistingUser()

    // Step 2: Test signup process
    await this.testSignupProcess()

    // Step 3: Verify user in database
    await this.verifyUserInDatabase()

    // Step 4: Test admin role assignment
    await this.testAdminRoleAssignment()

    // Step 5: Test email verification status
    await this.testEmailVerificationStatus()

    // Step 6: Test login with new credentials
    await this.testLoginProcess()

    // Step 7: Test admin access
    await this.testAdminAccess()

    this.printSummary()
  }

  private async checkExistingUser() {
    try {
      const { data: existingUser, error } = await this.supabase.auth.admin.getUserByEmail(TEST_USER.email)

      if (error && error.message !== "User not found") {
        this.addResult("Check Existing User", false, `Error checking user: ${error.message}`)
        return
      }

      if (existingUser?.user) {
        this.addResult("Check Existing User", true, "User already exists - will test with existing user", {
          id: existingUser.user.id,
          email: existingUser.user.email,
          created_at: existingUser.user.created_at,
        })
      } else {
        this.addResult("Check Existing User", true, "User does not exist - will create new user")
      }
    } catch (error) {
      this.addResult("Check Existing User", false, `Unexpected error: ${error}`)
    }
  }

  private async testSignupProcess() {
    try {
      // First, try to create user with admin service key
      const { data: signupData, error: signupError } = await this.supabase.auth.admin.createUser({
        email: TEST_USER.email,
        password: TEST_USER.password,
        user_metadata: {
          full_name: TEST_USER.fullName,
          role: TEST_USER.role,
        },
        email_confirm: true, // Auto-confirm email for testing
      })

      if (signupError) {
        if (signupError.message.includes("already registered")) {
          this.addResult("Signup Process", true, "User already exists - skipping signup")
          return
        }
        this.addResult("Signup Process", false, `Signup failed: ${signupError.message}`)
        return
      }

      this.addResult("Signup Process", true, "User created successfully", {
        id: signupData.user?.id,
        email: signupData.user?.email,
        email_confirmed_at: signupData.user?.email_confirmed_at,
      })
    } catch (error) {
      this.addResult("Signup Process", false, `Unexpected signup error: ${error}`)
    }
  }

  private async verifyUserInDatabase() {
    try {
      // Get user by email
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserByEmail(TEST_USER.email)

      if (userError) {
        this.addResult("Verify User in Database", false, `Error fetching user: ${userError.message}`)
        return
      }

      if (!userData?.user) {
        this.addResult("Verify User in Database", false, "User not found in auth.users")
        return
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        this.addResult("Verify User in Database", false, `Error fetching profile: ${profileError.message}`)
        return
      }

      this.addResult("Verify User in Database", true, "User found in database", {
        auth_user: {
          id: userData.user.id,
          email: userData.user.email,
          email_confirmed_at: userData.user.email_confirmed_at,
          created_at: userData.user.created_at,
        },
        profile: profile || "No profile found",
      })
    } catch (error) {
      this.addResult("Verify User in Database", false, `Unexpected database error: ${error}`)
    }
  }

  private async testAdminRoleAssignment() {
    try {
      // Get user first
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserByEmail(TEST_USER.email)

      if (userError || !userData?.user) {
        this.addResult("Admin Role Assignment", false, "Cannot test role - user not found")
        return
      }

      // Check if profile exists and create/update with admin role
      const { data: existingProfile } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await this.supabase
          .from("profiles")
          .update({
            role: TEST_USER.role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.user.id)
          .select()
          .single()

        if (updateError) {
          this.addResult("Admin Role Assignment", false, `Error updating profile role: ${updateError.message}`)
          return
        }

        this.addResult("Admin Role Assignment", true, "Admin role updated successfully", updatedProfile)
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await this.supabase
          .from("profiles")
          .insert({
            id: userData.user.id,
            email: userData.user.email!,
            full_name: TEST_USER.fullName,
            role: TEST_USER.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          this.addResult("Admin Role Assignment", false, `Error creating profile: ${insertError.message}`)
          return
        }

        this.addResult("Admin Role Assignment", true, "Admin profile created successfully", newProfile)
      }
    } catch (error) {
      this.addResult("Admin Role Assignment", false, `Unexpected role assignment error: ${error}`)
    }
  }

  private async testEmailVerificationStatus() {
    try {
      const { data: userData, error } = await this.supabase.auth.admin.getUserByEmail(TEST_USER.email)

      if (error || !userData?.user) {
        this.addResult("Email Verification Status", false, "Cannot check verification - user not found")
        return
      }

      const isVerified = !!userData.user.email_confirmed_at
      this.addResult(
        "Email Verification Status",
        isVerified,
        isVerified ? "Email is verified" : "Email is not verified",
        {
          email_confirmed_at: userData.user.email_confirmed_at,
          confirmation_sent_at: userData.user.confirmation_sent_at,
        },
      )
    } catch (error) {
      this.addResult("Email Verification Status", false, `Unexpected verification error: ${error}`)
    }
  }

  private async testLoginProcess() {
    try {
      // Create a new client for testing login (without service key)
      const testClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password,
      })

      if (loginError) {
        this.addResult("Login Process", false, `Login failed: ${loginError.message}`)
        return
      }

      if (!loginData.session) {
        this.addResult("Login Process", false, "Login succeeded but no session created")
        return
      }

      this.addResult("Login Process", true, "Login successful", {
        user_id: loginData.user?.id,
        session_expires_at: loginData.session.expires_at,
        access_token_length: loginData.session.access_token.length,
      })

      // Clean up session
      await testClient.auth.signOut()
    } catch (error) {
      this.addResult("Login Process", false, `Unexpected login error: ${error}`)
    }
  }

  private async testAdminAccess() {
    try {
      // Get user and check profile
      const { data: userData, error: userError } = await this.supabase.auth.admin.getUserByEmail(TEST_USER.email)

      if (userError || !userData?.user) {
        this.addResult("Admin Access Test", false, "Cannot test admin access - user not found")
        return
      }

      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      if (profileError) {
        this.addResult("Admin Access Test", false, `Error checking admin role: ${profileError.message}`)
        return
      }

      const hasAdminRole = profile?.role === "admin"
      this.addResult(
        "Admin Access Test",
        hasAdminRole,
        hasAdminRole
          ? "User has admin role - can access admin panel"
          : `User role is '${profile?.role}' - cannot access admin panel`,
        { current_role: profile?.role },
      )
    } catch (error) {
      this.addResult("Admin Access Test", false, `Unexpected admin access error: ${error}`)
    }
  }

  private printSummary() {


    const successful = this.results.filter((r) => r.success).length
    const total = this.results.length



    if (total - successful > 0) {

      this.results
        .filter((r) => !r.success)
        .forEach((result) => {

        })
    }


  }
}

// Run the test
async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {

    process.exit(1)
  }

  const tester = new SignupTester()
  await tester.testUserSignup()
}

if (require.main === module) {
  main().catch(() => {})
}

export { SignupTester }
