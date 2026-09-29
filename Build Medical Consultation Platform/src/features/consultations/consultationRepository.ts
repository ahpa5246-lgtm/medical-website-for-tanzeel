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
}) {
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      patient_id: input.patientId,
      specialty_id: input.specialtyId,
      subject: input.subject.trim(),
      body: input.body.trim(),
      emergency_flag: input.emergencyFlag,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as ConsultationRecord
}

export async function listMyConsultations(patientId: string) {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
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

export async function listMessages(consultationId: string) {
  const { data, error } = await supabase
    .from("consultation_messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []) as ConsultationMessage[]
}

export async function sendMessage(input: {
  consultationId: string
  senderId: string
  senderKind: "patient" | "doctor" | "staff"
  body: string
}) {
  const { data, error } = await supabase
    .from("consultation_messages")
    .insert({
      consultation_id: input.consultationId,
      sender_id: input.senderId,
      sender_kind: input.senderKind,
      body: input.body.trim(),
    })
    .select("*")
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
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")
  const path = `${consultationId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage
    .from("consultation-attachments")
    .upload(path, file, { upsert: false })
  if (error) throw error
  return path
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
