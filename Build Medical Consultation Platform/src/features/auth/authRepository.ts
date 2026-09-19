import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

export type AppRole = Database["public"]["Enums"]["app_role"]
export type AccountProfile = Database["public"]["Tables"]["profiles"]["Row"]

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function requestPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}/auth/update-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  if (error) throw error
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, status, created_at, updated_at")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}
