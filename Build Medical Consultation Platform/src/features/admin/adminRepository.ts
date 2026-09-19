import { supabase } from "@/lib/supabase"
import type { DoctorDraft } from "./doctorDraft"

export class DoctorRevisionConflict extends Error {
  constructor() {
    super("تعارض في التعديلات: تم تحديث هذا الملف من مستخدم آخر.")
    this.name = "DoctorRevisionConflict"
  }
}

export async function listSpecialties() {
  const { data, error } = await supabase.from("specialties").select("id, name_ar").eq("is_active", true).order("sort_order")
  if (error) throw error
  return data ?? []
}

export async function getAdminDoctor(id: string) {
  const { data, error } = await supabase.from("doctors").select("id, slug, display_name, profile_kind, specialty_id, bio, languages, interests, image_path, image_alt, publication_status, revision").eq("id", id).single()
  if (error) throw error
  return data
}

const makeSlug = (name: string) => `${name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`

export async function saveDoctor(input: DoctorDraft & { id?: string }, expectedRevision?: number) {
  const payload = { display_name: input.display_name.trim(), specialty_id: input.specialty_id, bio: input.bio.trim(), profile_kind: input.profile_kind, languages: input.languages, interests: input.interests, image_path: input.image_path, image_alt: input.image_alt.trim() }
  if (!input.id) {
    const { data, error } = await supabase.from("doctors").insert({ ...payload, slug: makeSlug(input.display_name), publication_status: "draft" }).select("id, revision, publication_status").single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("doctors").update(payload).eq("id", input.id).eq("revision", expectedRevision ?? -1).select("id, revision, publication_status").maybeSingle()
  if (error) throw error
  if (!data) throw new DoctorRevisionConflict()
  return data
}

export async function transitionDoctor(id: string, transition: "review" | "published" | "draft" | "archived", expectedRevision: number) {
  const { data, error } = await supabase.from("doctors").update({ publication_status: transition, published_at: transition === "published" ? new Date().toISOString() : null }).eq("id", id).eq("revision", expectedRevision).select("id, revision, publication_status").maybeSingle()
  if (error) throw error
  if (!data) throw new DoctorRevisionConflict()
  return data
}

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
