import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { DoctorCardRecord, DoctorPage } from "./types"
import { DEMO_DOCTORS } from "./demoDoctors"

export const PUBLIC_DOCTOR_COLUMNS =
  "id, slug, display_name, profile_kind, bio, image_path, image_alt, languages, interests, specialties(name_ar, slug)"

interface ListDoctorsInput {
  query?: string

  specialtyId?: string

  page?: number

  pageSize?: number
}

export async function listPublishedDoctors({
  query = "",

  specialtyId,

  page = 1,

  pageSize = 9,
}: ListDoctorsInput = {}): Promise<DoctorPage> {
  if (!isSupabaseConfigured()) {
    const term = query.trim().toLocaleLowerCase("ar")
    const matches = DEMO_DOCTORS.filter((doctor) =>
      `${doctor.display_name} ${doctor.bio} ${doctor.specialties?.name_ar}`
        .toLocaleLowerCase("ar")
        .includes(term),
    )
    return {
      doctors: matches.slice((page - 1) * pageSize, page * pageSize),
      count: matches.length,
    }
  }
  const safePage = Math.max(1, page)

  const safeSize = Math.min(24, Math.max(1, pageSize))

  const from = (safePage - 1) * safeSize

  const to = from + safeSize - 1

  let request = supabase

    .from("doctors")

    .select(PUBLIC_DOCTOR_COLUMNS, { count: "exact" })

    .eq("publication_status", "published")

    .order("published_at", { ascending: false })

    .range(from, to)

  if (specialtyId) request = request.eq("specialty_id", specialtyId)

  const normalized = query.trim().replace(/[,%()]/g, " ")

  if (normalized) {
    request = request.or(
      `display_name.ilike.%${normalized}%,bio.ilike.%${normalized}%`,
    )
  }

  const { data, count, error } = await request

  if (error) throw error

  return {
    doctors: (data ?? []) as unknown as DoctorCardRecord[],

    count: count ?? 0,
  }
}

export async function getPublishedDoctorBySlug(slug: string) {
  if (!isSupabaseConfigured()) {
    return DEMO_DOCTORS.find((doctor) => doctor.slug === slug) ?? null
  }
  const { data, error } = await supabase

    .from("doctors")

    .select(PUBLIC_DOCTOR_COLUMNS)

    .eq("publication_status", "published")

    .eq("slug", slug)

    .maybeSingle()

  if (error) throw error

  return data as unknown as DoctorCardRecord | null
}

export function doctorImageUrl(path: string | null) {
  if (!path) return "/doctors/placeholder.svg"
  return supabase.storage.from("doctor-images").getPublicUrl(path).data
    .publicUrl
}
