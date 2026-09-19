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
