import { supabase } from "@/lib/supabase"

export async function getAdminSummary() {
  const states = ["draft", "review", "published", "archived"] as const
  const counts = await Promise.all(
    states.map(async (status) => {
      const { count, error } = await supabase
        .from("doctors")
        .select("id", { count: "exact", head: true })
        .eq("publication_status", status)
      if (error) throw error
      return [status, count ?? 0] as const
    }),
  )
  return Object.fromEntries(counts) as Record<typeof states[number], number>
}

export async function listAdminDoctors(page = 1, pageSize = 20) {
  const safePage = Math.max(1, page)
  const from = (safePage - 1) * pageSize
  const to = from + pageSize - 1
  const { data, count, error } = await supabase
    .from("doctors")
    .select(
      "id, slug, display_name, profile_kind, publication_status, revision, updated_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to)
  if (error) throw error
  return { doctors: data ?? [], count: count ?? 0 }
}
