export type Json = string | number | boolean | null | {
  [key: string]: Json | undefined
} | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["account_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          id: string
          slug: string
          name_ar: string
          description: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_ar: string
          description?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["specialties"]["Insert"]>
        Relationships: []
      }
      doctors: {
        Row: {
          id: string
          slug: string
          display_name: string
          profile_kind: "fictional_demo" | "real_provider"
          specialty_id: string
          bio: string
          languages: string[]
          interests: string[]
          image_path: string | null
          image_alt: string
          verification_status: string
          publication_status: "draft" | "review" | "published" | "archived"
          revision: number
          published_at: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          display_name: string
          profile_kind?: "fictional_demo" | "real_provider"
          specialty_id: string
          bio: string
          languages?: string[]
          interests?: string[]
          image_path?: string | null
          image_alt?: string
          verification_status?: string
          publication_status?: "draft" | "review" | "published" | "archived"
          revision?: number
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      app_role: "owner" | "admin" | "editor" | "member"
      account_status: "active" | "disabled"
    }
    CompositeTypes: Record<string, never>
  }
}
