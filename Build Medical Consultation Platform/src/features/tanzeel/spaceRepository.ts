import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import {
  archiveDemoSpaceEntry,
  getDemoSpaceEntry,
  listDemoSpaceEntries,
  publishDemoSpaceEntry,
  saveDemoSpaceEntry,
  validateSpaceEntry,
  type SpaceDraft,
  type SpaceEntry,
} from "./demoSpace.mjs"

export type { SpaceDraft, SpaceEntry, SpaceKind } from "./demoSpace.mjs"

export const isSpaceDemo = () => !isSupabaseConfigured()

const mapEntry = (entry: {
  id: string
  kind: SpaceEntry["kind"]
  title: string
  summary: string
  body: string
  rating: number | null
  link_url: string
  status: SpaceEntry["status"]
  revision: number
  published_at: string | null
  updated_at: string
}): SpaceEntry => ({ ...entry, is_demo: false })

export async function listSpaceEntries(
  includeDrafts = false,
): Promise<SpaceEntry[]> {
  if (isSpaceDemo()) return listDemoSpaceEntries(localStorage, includeDrafts)
  let query = supabase
    .from("tanzeel_space_entries")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(100)
  if (!includeDrafts) query = query.eq("status", "published")
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapEntry)
}

export async function getSpaceEntry(id: string): Promise<SpaceEntry | null> {
  if (isSpaceDemo()) return getDemoSpaceEntry(localStorage, id)
  const { data, error } = await supabase
    .from("tanzeel_space_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? mapEntry(data) : null
}

export async function saveSpaceEntry(
  input: SpaceDraft,
  revision?: number,
): Promise<SpaceEntry> {
  validateSpaceEntry(input)
  if (isSpaceDemo()) return saveDemoSpaceEntry(localStorage, input)
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("سجّلي الدخول قبل الحفظ.")
  const fields = {
    kind: input.kind,
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    rating: input.kind === "book_review" ? input.rating : null,
    link_url: input.link_url.trim(),
    status: "draft" as const,
  }
  if (input.id) {
    if (revision === undefined) throw new Error("تعذر التحقق من نسخة المنشور.")
    const { data, error } = await supabase
      .from("tanzeel_space_entries")
      .update(fields)
      .eq("id", input.id)
      .eq("revision", revision)
      .select()
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error("تغير المنشور في مكان آخر. أعيدي تحميل الصفحة.")
    return mapEntry(data)
  }
  const { data, error } = await supabase
    .from("tanzeel_space_entries")
    .insert({ ...fields, author_id: auth.user.id })
    .select()
    .single()
  if (error) throw error
  return mapEntry(data)
}

async function changeStatus(
  id: string,
  status: "published" | "archived",
  revision?: number,
): Promise<SpaceEntry> {
  if (isSpaceDemo())
    return status === "published"
      ? publishDemoSpaceEntry(localStorage, id)
      : archiveDemoSpaceEntry(localStorage, id)
  if (revision === undefined) throw new Error("تعذر التحقق من نسخة المنشور.")
  const { data, error } = await supabase
    .from("tanzeel_space_entries")
    .update({ status })
    .eq("id", id)
    .eq("revision", revision)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error("تغير المنشور في مكان آخر. أعيدي تحميل الصفحة.")
  return mapEntry(data)
}

export const publishSpaceEntry = (id: string, revision?: number) =>
  changeStatus(id, "published", revision)
export const archiveSpaceEntry = (id: string, revision?: number) =>
  changeStatus(id, "archived", revision)
