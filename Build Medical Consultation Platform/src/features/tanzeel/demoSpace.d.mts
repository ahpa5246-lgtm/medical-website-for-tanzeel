export type SpaceKind = "book_review" | "article" | "achievement" | "course"
export type SpaceStatus = "draft" | "review" | "published" | "archived"

export interface SpaceDraft {
  id?: string
  kind: SpaceKind
  title: string
  summary: string
  body: string
  rating: number | null
  link_url: string
}

export interface SpaceEntry extends SpaceDraft {
  id: string
  status: SpaceStatus
  revision: number
  is_demo: boolean
  published_at: string | null
  updated_at: string
}

export function validateSpaceEntry(input: SpaceDraft): void
export function listDemoSpaceEntries(
  storage: Storage,
  includeDrafts?: boolean,
): SpaceEntry[]
export function getDemoSpaceEntry(
  storage: Storage,
  id: string,
): SpaceEntry | null
export function saveDemoSpaceEntry(
  storage: Storage,
  input: SpaceDraft,
): SpaceEntry
export function publishDemoSpaceEntry(storage: Storage, id: string): SpaceEntry
export function archiveDemoSpaceEntry(storage: Storage, id: string): SpaceEntry
