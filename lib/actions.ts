"use server"
import { logger } from "@/lib/logger"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    console.log("[v0] Attempting sign in for:", email.toString())

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      console.log("[v0] Sign in error:", error)
      return { error: error.message }
    }

    console.log("[v0] Sign in successful")
    return { success: true }
  } catch (error) {
    console.log("[v0] Unexpected sign in error:", error)
    logger.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    console.log("[v0] Attempting sign up for:", email.toString())
    console.log("[v0] Full name:", fullName?.toString() || "Not provided")

    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          full_name: fullName?.toString() || "",
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      console.log("[v0] Sign up auth error:", error)
      return { error: `Failed to create user: ${error.message}` }
    }

    if (!data.user) {
      console.log("[v0] No user returned from sign up")
      return { error: "Failed to create user: No user data returned" }
    }

    console.log("[v0] User created successfully:", data.user.id)

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: email.toString(),
          full_name: fullName?.toString() || null,
          role: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (profileError) {
        console.log("[v0] Profile creation error:", profileError)
        // Don't fail the entire signup if profile creation fails
        console.log("[v0] User created but profile creation failed - this is recoverable")
      } else {
        console.log("[v0] Profile created successfully:", profileData)
      }
    } catch (profileError) {
      console.log("[v0] Profile creation exception:", profileError)
      // Continue - profile can be created later
    }

    return { success: "โปรดตรวจอีเมลยืนยัน" }
  } catch (error) {
    console.log("[v0] Unexpected sign up error:", error)
    logger.error("Sign up error:", error)
    return { error: `Failed to create user: Database error creating new user. ${error}` }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
