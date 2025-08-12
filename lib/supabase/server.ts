import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "./client"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createClient = cache(() => {
  try {
    const cookieStore = cookies()

    if (!isSupabaseConfigured) {
      console.warn("Supabase environment variables are not set. Using dummy client.")
      return {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          signOut: () => Promise.resolve({ error: null }),
        },
        from: (table: string) => ({
          select: (columns?: string) => ({
            eq: (column: string, value: any) => ({
              single: () => Promise.resolve({ data: null, error: null }),
              limit: (count: number) => Promise.resolve({ data: [], error: null }),
            }),
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
          insert: (values: any) => Promise.resolve({ data: null, error: null }),
          update: (values: any) => ({
            eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
          }),
          delete: () => ({
            eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
          }),
        }),
      } as any
    }

    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    // Return safe fallback client
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Server error" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Server error" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
        }),
        insert: (values: any) => Promise.resolve({ data: null, error: null }),
        update: (values: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any
  }
})
