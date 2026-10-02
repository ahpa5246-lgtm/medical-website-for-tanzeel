import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { Json } from "@/lib/database.types"
import {
  getDemoContent,
  listDemoContent,
  publishDemoContent,
  saveDemoContent,
  type ContentDraft,
  type ContentEntry,
  type ContentKind,
  type Lesson,
} from "./demoContent.mjs"

export type { ContentDraft, ContentEntry, ContentKind, Lesson }

export const isContentDemo = () => !isSupabaseConfigured()

const mapEntry = (row: {
  id: string
  kind: ContentKind
  title: string
  summary: string
  body: string
  category: string
  author_name: string
  author_id: string
  status: ContentEntry["status"]
  lessons: Json
  source_url: string
  updated_at: string
  published_at: string | null
  revision: number
}): ContentEntry => ({
  ...row,
  lessons: Array.isArray(row.lessons) ? row.lessons as unknown as Lesson[] : [],
})

export async function listContent(kind: ContentKind): Promise<ContentEntry[]> {
  if (isContentDemo()) return listDemoContent(localStorage, kind)
  const { data, error } = await supabase
    .from("content_entries")
    .select("*")
    .eq("kind", kind)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(48)
  if (error) throw error
  return (data ?? []).map(mapEntry)
}

export async function listMyContent(): Promise<ContentEntry[]> {
  if (isContentDemo()) {
    return [
      ...listDemoContent(localStorage, "course", true),
      ...listDemoContent(localStorage, "library", true),
    ]
  }
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return []
  const { data, error } = await supabase
    .from("content_entries")
    .select("*")
    .eq("author_id", auth.user.id)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapEntry)
}

export async function listReviewContent(): Promise<ContentEntry[]> {
  if (isContentDemo()) return []
  const { data, error } = await supabase
    .from("content_entries")
    .select("*")
    .eq("status", "review")
    .order("updated_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(mapEntry)
}

export async function getContent(id: string): Promise<ContentEntry | null> {
  if (isContentDemo()) return getDemoContent(localStorage, id)
  const { data, error } = await supabase
    .from("content_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? mapEntry(data) : null
}

export async function canAuthorContent(): Promise<boolean> {
  if (isContentDemo()) return true
  const { data, error } = await supabase.rpc("can_author_content")
  if (error) throw error
  return data === true
}

export async function saveContent(
  input: ContentDraft,
  revision?: number,
): Promise<ContentEntry> {
  if (isContentDemo()) return saveDemoContent(localStorage, input)
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("سجّلي الدخول قبل حفظ المحتوى.")
  const fields = {
    kind: input.kind,
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    category: input.category.trim(),
    lessons: input.lessons as unknown as Json,
    source_url: input.source_url.trim(),
    status: "draft" as const,
  }
  if (input.id) {
    if (revision === undefined) throw new Error("تعذر التحقق من نسخة المسودة.")
    const { data, error } = await supabase
      .from("content_entries")
      .update(fields)
      .eq("id", input.id)
      .eq("revision", revision)
      .select()
      .maybeSingle()
    if (error) throw error
    if (!data)
      throw new Error("عُدّلت المسودة في مكان آخر. أعيدي تحميل الصفحة قبل الحفظ.")
    return mapEntry(data)
  }
  const { data, error } = await supabase
    .from("content_entries")
    .insert({ ...fields, author_id: auth.user.id })
    .select()
    .single()
  if (error) throw error
  return mapEntry(data)
}

export async function publishContent(
  id: string,
  revision?: number,
): Promise<ContentEntry> {
  if (isContentDemo()) return publishDemoContent(localStorage, id)
  if (revision === undefined) throw new Error("تعذر التحقق من نسخة المسودة.")
  const { data, error } = await supabase
    .from("content_entries")
    .update({ status: "published" })
    .eq("id", id)
    .eq("revision", revision)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error("تغيرت المسودة قبل النشر. أعيدي تحميل الصفحة.")
  return mapEntry(data)
}

export async function submitContent(
  id: string,
  revision?: number,
): Promise<ContentEntry> {
  if (isContentDemo()) return publishDemoContent(localStorage, id)
  if (revision === undefined) throw new Error("تعذر التحقق من نسخة المسودة.")
  const { data, error } = await supabase
    .from("content_entries")
    .update({ status: "review" })
    .eq("id", id)
    .eq("revision", revision)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error("تغيرت المسودة قبل الإرسال. أعيدي تحميل الصفحة.")
  return mapEntry(data)
}

export async function getCompletedLessons(
  contentId: string,
): Promise<number[]> {
  if (isContentDemo()) {
    try {
      const value = JSON.parse(
        localStorage.getItem(`course-progress:${contentId}`) || "[]",
      )
      return Array.isArray(value) ? value.filter(Number.isInteger) : []
    } catch {
      return []
    }
  }
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return []
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_index")
    .eq("content_id", contentId)
    .eq("user_id", auth.user.id)
  if (error) throw error
  return (data ?? []).map((row) => row.lesson_index)
}

export async function completeLesson(
  contentId: string,
  lessonIndex: number,
): Promise<void> {
  if (isContentDemo()) {
    const completed = await getCompletedLessons(contentId)
    localStorage.setItem(
      `course-progress:${contentId}`,
      JSON.stringify([...new Set([...completed, lessonIndex])]),
    )
    return
  }
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error("سجّلي الدخول لحفظ التقدم.")
  const { error } = await supabase.from("lesson_progress").upsert({
    user_id: auth.user.id,
    content_id: contentId,
    lesson_index: lessonIndex,
  })
  if (error) throw error
}
