import { supabase } from "@/lib/supabase"

export type ConsultationStatus = "open" | "assigned" | "answered" | "closed"

export interface ConsultationRecord {
  id: string
  patient_id: string
  doctor_id: string | null
  specialty_id: string
  subject: string
  body: string
  status: ConsultationStatus
  emergency_flag: boolean
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface SpecialtyOption {
  id: string
  slug: string
  name_ar: string
}

export async function listActiveSpecialties() {
  const { data, error } = await supabase
    .from("specialties")
    .select("id, slug, name_ar")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
  if (error) throw error
  return (data ?? []) as SpecialtyOption[]
}

export interface ConsultationMessage {
  id: string
  consultation_id: string
  sender_id: string
  sender_kind: "patient" | "doctor" | "staff"
  body: string
  created_at: string
}

export async function createConsultation(input: {
  patientId: string
  specialtyId: string
  subject: string
  body: string
  emergencyFlag: boolean
  operationId: string
}) {
  const { data, error } = await supabase
    .rpc("create_consultation", {
      p_specialty_id: input.specialtyId,
      p_subject: input.subject.trim(),
      p_body: input.body.trim(),
      p_emergency: input.emergencyFlag,
      p_operation_id: input.operationId,
    })
    .single()
  if (error) throw error
  return data as ConsultationRecord
}

export async function listMyConsultations(patientId: string, page = 1) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    // RLS returns only owned, assigned-provider or authorized staff records.
    .order("created_at", { ascending: false })
    .order("id")
    .range((Math.max(1, page) - 1) * 20, Math.max(1, page) * 20 - 1)
  if (error) throw error
  return (data ?? []) as ConsultationRecord[]
}

export async function getConsultation(id: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as ConsultationRecord | null
}

export async function listMessages(consultationId: string, page = 1) {
  const { data, error } = await supabase
    .from("consultation_messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true })
    .order("id")
    .range((Math.max(1, page) - 1) * 50, Math.max(1, page) * 50 - 1)
  if (error) throw error
  return (data ?? []) as ConsultationMessage[]
}

export async function sendMessage(input: {
  consultationId: string
  senderId: string
  senderKind: "patient" | "doctor" | "staff"
  operationId: string
  body: string
}) {
  const { data, error } = await supabase
    .rpc("send_consultation_message", {
      p_consultation_id: input.consultationId,
      p_body: input.body.trim(),
      p_operation_id: input.operationId,
    })
    .single()
  if (error) throw error
  return data as ConsultationMessage
}

export async function saveRating(input: {
  consultationId: string
  patientId: string
  rating: number
  comment?: string
}) {
  const { error } = await supabase.from("consultation_ratings").upsert({
    consultation_id: input.consultationId,
    patient_id: input.patientId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
  })
  if (error) throw error
}

export async function uploadAttachment(consultationId: string, file: File) {
  if (
    file.size < 1 ||
    file.size > 10 * 1024 * 1024 ||
    !["application/pdf", "image/jpeg", "image/png"].includes(file.type)
  )
    throw new Error("المرفق PDF أو صورة حتى 10 ميغابايت.")
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("يلزم الدخول.")
  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100) || "attachment"
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  const hash = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("")
  const path = `${consultationId}/${user.id}-${hash}`
  const { error } = await supabase.storage
    .from("consultation-attachments")
    .upload(path, file, { upsert: false })
  if (error) {
    const { error: missing } = await supabase.storage
      .from("consultation-attachments")
      .createSignedUrl(path, 60)
    if (missing) throw error
  }
  const { error: metadataError } = await supabase
    .from("consultation_attachments")
    .upsert(
      {
        consultation_id: consultationId,
        uploaded_by: user.id,
        path,
        file_name: safeName,
        file_size: file.size,
        mime_type: file.type,
      },
      { onConflict: "path", ignoreDuplicates: true },
    )
  if (metadataError) throw metadataError
  return path
}
export async function listAttachments(consultationId: string) {
  const { data, error } = await supabase
    .from("consultation_attachments")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at")
    .limit(50)
  if (error) throw error
  return data ?? []
}
export async function attachmentUrl(path: string, fileName: string) {
  const { data, error } = await supabase.storage
    .from("consultation-attachments")
    .createSignedUrl(path, 60, { download: fileName })
  if (error) throw error
  return data.signedUrl
}

export async function listAdminConsultations() {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as ConsultationRecord[]
}

export async function updateConsultationAdmin(
  id: string,
  patch: {
    status?: ConsultationStatus
    doctor_id?: string | null
    subject?: string
    body?: string
  },
) {
  const payload = {
    ...patch,
    closed_at: patch.status === "closed" ? new Date().toISOString() : undefined,
  }
  const { data, error } = await supabase
    .from("consultations")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as ConsultationRecord
}
