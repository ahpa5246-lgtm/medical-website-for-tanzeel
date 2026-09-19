import { supabase } from "@/lib/supabase"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateDoctorImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new Error("اختر صورة بصيغة JPG أو PNG أو WebP.")
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("يجب ألا يتجاوز حجم الصورة 5 ميغابايت.")
}

export async function uploadDoctorImage(file: File, doctorId: string) {
  validateDoctorImage(file)
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg"
  const path = `${doctorId}/portrait.${extension}`
  const { error } = await supabase.storage
    .from("doctor-images")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: true,
    })
  if (error) throw new Error(`تعذر رفع الصورة: ${error.message}`)
  return path
}
