export type ContentKind = "course" | "library"
export type ContentStatus = "draft" | "review" | "published" | "archived"

export interface Lesson {
  title: string
  body: string
  question: string
  options: string[]
  correct_index: number
}

export interface ContentEntry {
  id: string
  kind: ContentKind
  title: string
  summary: string
  body: string
  category: string
  author_name: string
  author_id: string | null
  status: ContentStatus
  lessons: Lesson[]
  source_url: string
  updated_at: string
  published_at: string | null
  revision?: number
}

export type ContentDraft = Pick<ContentEntry, "kind" | "title" | "summary" | "body" | "category" | "author_name" | "lessons" | "source_url"> & {
  id?: string
}
export interface DemoStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function listDemoContent(
  storage: DemoStorage,
  kind: ContentKind,
  includeDrafts?: boolean,
): ContentEntry[]
export function getDemoContent(
  storage: DemoStorage,
  id: string,
): ContentEntry | null
export function saveDemoContent(
  storage: DemoStorage,
  input: ContentDraft,
): ContentEntry
export function publishDemoContent(
  storage: DemoStorage,
  id: string,
): ContentEntry
