export interface DoctorDraft {
  display_name: string
  specialty_id: string
  bio: string
  profile_kind: "fictional_demo" | "real_provider"
  provider_user_id: string | null
  verification_status: "not_applicable" | "pending" | "verified" | "rejected" | "suspended"
  languages: string[]
  interests: string[]
  image_path: string | null
  image_alt: string
}

export type DoctorDraftErrors = Partial<Record<keyof DoctorDraft, string>>

export const EMPTY_DOCTOR_DRAFT: DoctorDraft = {
  display_name: "",
  specialty_id: "",
  bio: "",
  profile_kind: "fictional_demo",
  provider_user_id: null,
  verification_status: "not_applicable",
  languages: ["العربية"],
  interests: [],
  image_path: null,
  image_alt: "",
}

export function validateDoctorDraft(draft: DoctorDraft): DoctorDraftErrors {
  const errors: DoctorDraftErrors = {}
  if (!draft.display_name.trim()) errors.display_name = "الاسم العربي مطلوب."
  if (!draft.specialty_id) errors.specialty_id = "التخصص مطلوب."
  if (draft.bio.trim().length < 40)
    errors.bio = "النبذة يجب ألا تقل عن 40 حرفًا."
  if (!draft.image_alt.trim() && draft.image_path)
    errors.image_alt = "النص البديل للصورة مطلوب."
  if (draft.profile_kind === "real_provider" && !draft.provider_user_id)
    errors.provider_user_id = "اربط مقدم الخدمة بحساب مسجل قبل النشر."
  return errors
}

const storageKey = (id: string) => `medconnect:doctor-draft:${id}`

export function saveRecoveryDraft(id: string, draft: DoctorDraft) {
  localStorage.setItem(storageKey(id), JSON.stringify(draft))
}

export function loadRecoveryDraft(id: string): DoctorDraft | null {
  const value = localStorage.getItem(storageKey(id))
  if (!value) return null
  try {
    return JSON.parse(value) as DoctorDraft
  } catch {
    localStorage.removeItem(storageKey(id))
    return null
  }
}

export function clearRecoveryDraft(id: string) {
  localStorage.removeItem(storageKey(id))
}
