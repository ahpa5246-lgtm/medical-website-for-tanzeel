import { supabase } from "@/lib/supabase"
import type { AppRole } from "@/features/auth/authRepository"

export async function listAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, status, created_at, updated_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function inviteAdminUser(
  email: string,
  role: Extract<AppRole, "admin" | "editor">,
) {
  const { data, error } = await supabase.functions.invoke("admin-invite", {
    body: { email: email.trim().toLowerCase(), role },
  })
  if (error) throw error
  return data as { message: string }
}

export async function updateAdminUser(
  targetId: string,
  operation: "enable" | "disable" | "set_role",
  role?: Extract<AppRole, "admin" | "editor">,
) {
  const { data, error } = await supabase.functions.invoke("admin-user-status", {
    body: { targetId, operation, role },
  })
  if (error) throw error
  return data as { message: string }
}
