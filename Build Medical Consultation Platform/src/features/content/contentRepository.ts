import { supabase } from "@/lib/supabase"
import type { ContentItem, ContentKind, VerificationRecord } from "./types"
import { validateContent, validateVerification } from "./validation.mjs"

export async function listContent(
  kind: ContentKind,
  query = "",
  page = 1,
  review = false,
) {
  let request = supabase
    .from("content_items")
    .select("*", { count: "exact" })
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .order("id")
    .range((Math.max(1, page) - 1) * 12, Math.max(1, page) * 12 - 1)
  if (!review) request = request.eq("status", "published")
  const q = query.trim().replace(/[,%()]/g, " ")
  if (q) request = request.ilike("title", `%${q}%`)
  const { data, count, error } = await request
  if (error) throw error
  return { items: data as ContentItem[] ?? [], count: count ?? 0 }
}
export async function getContent(id: string) {
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as ContentItem | null
}
export async function saveContent(
  input: {
    id?: string
    kind: ContentKind
    title: string
    body: string
    category: string
    status: "draft" | "review"
  },
  expectedRevision?: number,
) {
  const validation = validateContent(input)
  if (!validation.ok) throw new Error(validation.message)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("يلزم تسجيل الدخول.")
  const payload = {
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category.trim(),
    status: input.status,
  }
  const request = input.id
    ? supabase
        .from("content_items")
        .update(payload)
        .eq("id", input.id)
        .eq("revision", expectedRevision ?? -1)
    : supabase.from("content_items").insert({ ...payload, author_id: user.id })
  const { data, error } = await request.select("*").maybeSingle()
  if (error) throw error
  if (!data) throw new Error("تغيّرت المسودة؛ أعيدي تحميلها قبل الحفظ.")
  return data as ContentItem
}
export async function reviewContent(
  item: ContentItem,
  status: "published" | "archived" | "draft",
) {
  const { data, error } = await supabase
    .from("content_items")
    .update({ status })
    .eq("id", item.id)
    .eq("revision", item.revision)
    .select("id")
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error("تعارض في المراجعة؛ أعيدي التحميل.")
}
export async function getLearningState(
  contentId: string,
  kind: ContentKind,
  userId: string,
) {
  if (kind === "article") return false
  const { data, error } = await supabase
    .from(kind === "course" ? "course_progress" : "resource_bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle()
  if (error) throw error
  return kind === "course"
    ? Boolean(data && "completed" in data && data.completed)
    : Boolean(data)
}
export async function setLearningState(
  contentId: string,
  kind: ContentKind,
  userId: string,
  value: boolean,
) {
  const request =
    kind === "course"
      ? supabase
          .from("course_progress")
          .upsert({ user_id: userId, content_id: contentId, completed: value })
      : value
        ? supabase
            .from("resource_bookmarks")
            .upsert({ user_id: userId, content_id: contentId })
        : supabase
            .from("resource_bookmarks")
            .delete()
            .eq("user_id", userId)
            .eq("content_id", contentId)
  const { error } = await request
  if (error) throw error
}
export async function loadVerification(userId?: string) {
  let request = supabase
    .from("verification_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
  if (userId) request = request.eq("applicant_id", userId)
  const { data, error } = await request
  if (error) throw error
  return data as VerificationRecord[] ?? []
}
export async function submitVerification(input: {
  name: string
  specialty: string
  license: string
  experience: string
  bio: string
  consent: boolean
}) {
  const validation = validateVerification(input)
  if (!validation.ok) throw new Error(validation.message)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("يلزم تسجيل الدخول.")
  const { data, error } = await supabase
    .from("verification_applications")
    .upsert(
      {
        applicant_id: user.id,
        full_name: input.name.trim(),
        specialty_id: input.specialty,
        license_number: input.license.trim(),
        experience: Number(input.experience),
        bio: input.bio.trim(),
        consent: true,
        status: "pending",
        review_note: "",
        reviewed_by: null,
      },
      { onConflict: "applicant_id" },
    )
    .select("*")
    .single()
  if (error) throw error
  return data as VerificationRecord
}
export async function uploadVerification(
  application: VerificationRecord,
  file: File,
) {
  if (
    file.size > 5 * 1024 * 1024 ||
    !["application/pdf", "image/jpeg", "image/png"].includes(file.type)
  )
    throw new Error("الوثيقة PDF أو صورة وبحد أقصى 5 ميغابايت.")
  const path = `${application.applicant_id}/${application.id}/${crypto.randomUUID()}`
  const { error } = await supabase.storage
    .from("verification-documents")
    .upload(path, file)
  if (error) throw error
  const { error: updateError } = await supabase
    .from("verification_applications")
    .update({ document_path: path })
    .eq("id", application.id)
  if (updateError) throw updateError
}
export async function reviewVerification(
  id: string,
  status: VerificationRecord["status"],
  review_note: string,
) {
  const { error } = await supabase
    .from("verification_applications")
    .update({ status, review_note })
    .eq("id", id)
  if (error) throw error
}
export async function verificationDocumentUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("verification-documents")
    .createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}
