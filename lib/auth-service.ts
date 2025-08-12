import { createClient } from "@/lib/supabase/client"

export class AuthService {
  private getSupabase() {
    return createClient()
  }

  async signUp(email: string, password: string, userData?: any) {
    const supabase = this.getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""),
        data: userData,
      },
    })

    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const supabase = this.getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const supabase = this.getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const supabase = this.getSupabase()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async updateProfile(updates: any) {
    const supabase = this.getSupabase()
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error
    return data
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = this.getSupabase()
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const auth = new AuthService()
