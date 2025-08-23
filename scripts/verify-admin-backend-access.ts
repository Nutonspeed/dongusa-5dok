#!/usr/bin/env tsx

/**
 * Admin Backend Access Verification Script
 * Tests admin authentication and backend access functionality
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Test admin credentials
const ADMIN_EMAIL = "nuttapong161@gmail.com"
const ADMIN_PASSWORD = "127995803"

interface AccessTest {
  name: string
  success: boolean
  message: string
  data?: any
}

class AdminAccessTester {
  private serviceClient
  private userClient
  private tests: AccessTest[] = []

  constructor() {
    this.serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    this.userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  private addTest(name: string, success: boolean, message: string, data?: any) {
    this.tests.push({ name, success, message, data })

    if (data && typeof data === "object") {

    }
  }

  async runAllTests() {


    // Test 1: Database Connection
    await this.testDatabaseConnection()

    // Test 2: Admin User Exists
    await this.testAdminUserExists()

    // Test 3: Admin Login
    await this.testAdminLogin()

    // Test 4: Admin Role Verification
    await this.testAdminRoleVerification()

    // Test 5: Admin Panel Data Access
    await this.testAdminDataAccess()

    // Test 6: Admin Operations
    await this.testAdminOperations()

    this.printSummary()
  }

  private async testDatabaseConnection() {
    try {
      const { data, error } = await this.serviceClient.from("profiles").select("count").limit(1)

      if (error) {
        this.addTest("Database Connection", false, `Connection failed: ${error.message}`)
        return
      }

      this.addTest("Database Connection", true, "Successfully connected to database")
    } catch (error) {
      this.addTest("Database Connection", false, `Connection error: ${error}`)
    }
  }

  private async testAdminUserExists() {
    try {
      const { data: userData, error } = await this.serviceClient.auth.admin.getUserByEmail(ADMIN_EMAIL)

      if (error) {
        this.addTest("Admin User Exists", false, `Error checking user: ${error.message}`)
        return
      }

      if (!userData?.user) {
        this.addTest("Admin User Exists", false, "Admin user not found in database")
        return
      }

      this.addTest("Admin User Exists", true, "Admin user found", {
        id: userData.user.id,
        email: userData.user.email,
        email_confirmed: !!userData.user.email_confirmed_at,
        created_at: userData.user.created_at,
      })
    } catch (error) {
      this.addTest("Admin User Exists", false, `Unexpected error: ${error}`)
    }
  }

  private async testAdminLogin() {
    try {
      const { data: loginData, error: loginError } = await this.userClient.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })

      if (loginError) {
        this.addTest("Admin Login", false, `Login failed: ${loginError.message}`)
        return
      }

      if (!loginData.session) {
        this.addTest("Admin Login", false, "Login succeeded but no session created")
        return
      }

      this.addTest("Admin Login", true, "Admin login successful", {
        user_id: loginData.user?.id,
        session_expires_at: loginData.session.expires_at,
        has_access_token: !!loginData.session.access_token,
      })

      // Keep session for subsequent tests
      return loginData.session
    } catch (error) {
      this.addTest("Admin Login", false, `Login error: ${error}`)
      return null
    }
  }

  private async testAdminRoleVerification() {
    try {
      // Get current user session
      const { data: sessionData } = await this.userClient.auth.getSession()

      if (!sessionData.session) {
        this.addTest("Admin Role Verification", false, "No active session for role check")
        return
      }

      // Check profile role
      const { data: profile, error: profileError } = await this.userClient
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", sessionData.session.user.id)
        .single()

      if (profileError) {
        this.addTest("Admin Role Verification", false, `Error fetching profile: ${profileError.message}`)
        return
      }

      const isAdmin = profile?.role === "admin"
      this.addTest(
        "Admin Role Verification",
        isAdmin,
        isAdmin ? "User has admin role" : `User role is '${profile?.role}', not admin`,
        profile,
      )
    } catch (error) {
      this.addTest("Admin Role Verification", false, `Role verification error: ${error}`)
    }
  }

  private async testAdminDataAccess() {
    try {
      // Test access to admin-only data
      const tests = [
        { table: "profiles", description: "User profiles" },
        { table: "products", description: "Products" },
        { table: "orders", description: "Orders" },
        { table: "categories", description: "Categories" },
      ]

      let successCount = 0
      const results = []

      for (const test of tests) {
        try {
          const { data, error } = await this.userClient
            .from(test.table as any)
            .select("*")
            .limit(5)

          if (error) {
            results.push(`${test.description}: ❌ ${error.message}`)
          } else {
            results.push(`${test.description}: ✅ ${data?.length || 0} records`)
            successCount++
          }
        } catch (err) {
          results.push(`${test.description}: ❌ ${err}`)
        }
      }

      const allSuccess = successCount === tests.length
      this.addTest("Admin Data Access", allSuccess, `${successCount}/${tests.length} tables accessible`, results)
    } catch (error) {
      this.addTest("Admin Data Access", false, `Data access error: ${error}`)
    }
  }

  private async testAdminOperations() {
    try {
      // Test admin operations like creating/updating records
      const operations = []

      // Test 1: Create a test category
      const { data: newCategory, error: createError } = await this.userClient
        .from("categories")
        .insert({
          name: "Test Category",
          description: "Test category for admin access verification",
          slug: "test-category-admin-test",
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        operations.push(`Create Category: ❌ ${createError.message}`)
      } else {
        operations.push(`Create Category: ✅ Created ID ${newCategory?.id}`)

        // Test 2: Update the category
        const { error: updateError } = await this.userClient
          .from("categories")
          .update({ description: "Updated test category" })
          .eq("id", newCategory.id)

        if (updateError) {
          operations.push(`Update Category: ❌ ${updateError.message}`)
        } else {
          operations.push(`Update Category: ✅ Updated successfully`)
        }

        // Test 3: Delete the test category
        const { error: deleteError } = await this.userClient.from("categories").delete().eq("id", newCategory.id)

        if (deleteError) {
          operations.push(`Delete Category: ❌ ${deleteError.message}`)
        } else {
          operations.push(`Delete Category: ✅ Deleted successfully`)
        }
      }

      const successfulOps = operations.filter((op) => op.includes("✅")).length
      const totalOps = operations.length

      this.addTest(
        "Admin Operations",
        successfulOps > 0,
        `${successfulOps}/${totalOps} operations successful`,
        operations,
      )
    } catch (error) {
      this.addTest("Admin Operations", false, `Operations error: ${error}`)
    }
  }

  private printSummary() {


    const successful = this.tests.filter((t) => t.success).length
    const total = this.tests.length



    if (total - successful > 0) {

      this.tests
        .filter((t) => !t.success)
        .forEach((test) => {

        })
    }


    if (successful === total) {

    } else if (successful >= total * 0.7) {

    } else {

    }


  }

  async cleanup() {
    try {
      await this.userClient.auth.signOut()
    } catch (error) {

    }
  }
}

// Run the tests
async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {

    process.exit(1)
  }

  const tester = new AdminAccessTester()
  try {
    await tester.runAllTests()
  } finally {
    await tester.cleanup()
  }
}

if (require.main === module) {
  main().catch(() => {})
}

export { AdminAccessTester }
