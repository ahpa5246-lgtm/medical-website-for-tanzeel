export interface DoctorCardRecord {
  id: string
  slug: string
  display_name: string
  profile_kind: "fictional_demo" | "real_provider"
  bio: string
  image_path: string | null
  image_alt: string
  languages: string[]
  interests: string[]
  specialties: { name_ar: string slug: string } | null
}

export interface DoctorPage {
  doctors: DoctorCardRecord[]
  count: number
}
