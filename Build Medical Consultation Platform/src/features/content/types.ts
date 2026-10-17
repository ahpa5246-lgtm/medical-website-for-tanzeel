export type ContentKind = "article" | "course" | "resource"
export type ContentItem = {
  id: string
  kind: ContentKind
  title: string
  body: string
  category: string
  author_id: string
  status: "draft" | "review" | "published" | "archived"
  reviewed_by: string | null
  revision: number
  created_at: string
  updated_at: string
}
export type VerificationRecord = {
  id: string
  applicant_id: string
  full_name: string
  specialty_id: string
  license_number: string
  experience: number
  bio: string
  consent: boolean
  status: "pending" | "approved" | "needs_information" | "rejected"
  review_note: string
  reviewed_by: string | null
  document_path: string | null
  created_at: string
  updated_at: string
}
type Table<Row,
Insert = Partial<Row>,
Update = Partial<Row>,> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}
export type TrainingTask = {
  stage_id: string
  title: string
  instructions: string
  questions: {
    prompt: string
    options: string[]
  }[]
  is_published: boolean
}
export type Attachment = {
  id: string
  consultation_id: string
  uploaded_by: string
  path: string
  file_name: string
  file_size: number
  mime_type: string
  created_at: string
}
export type ContentTables = {
  consultation_attachments: Table<Attachment>
  training_tasks: Table<TrainingTask>
  content_items: Table<ContentItem, Pick<ContentItem, "kind" | "title" | "body" | "category" | "author_id"> & Partial<ContentItem>>
  resource_bookmarks: Table<{
    user_id: string
    content_id: string
    created_at: string
  }, {
    user_id: string
    content_id: string
  }>
  course_progress: Table<{
    user_id: string
    content_id: string
    completed: boolean
    updated_at: string
  }, {
    user_id: string
    content_id: string
    completed: boolean
  }>
  verification_applications: Table<VerificationRecord, Pick<VerificationRecord, "applicant_id" | "full_name" | "specialty_id" | "license_number" | "experience" | "consent"> & Partial<VerificationRecord>>
  training_progress: Table<{
    user_id: string
    stage_id: string
    xp: number
    completed_at: string
  }>
}
