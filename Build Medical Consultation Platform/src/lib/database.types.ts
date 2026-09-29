export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type AppRole = "owner" | "admin" | "editor" | "member"
type AccountStatus = "active" | "disabled"
type ConsultationStatus = "open" | "assigned" | "answered" | "closed"
type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id:string; display_name:string; role:AppRole; status:AccountStatus; created_at:string; updated_at:string }
        Insert: { id:string; display_name:string; role?:AppRole; status?:AccountStatus; created_at?:string; updated_at?:string }
        Update: { display_name?:string; role?:AppRole; status?:AccountStatus; updated_at?:string }
        Relationships: []
      }
      specialties: {
        Row: { id:string; slug:string; name_ar:string; description:string; is_active:boolean; sort_order:number; created_at:string; updated_at:string }
        Insert: { id?:string; slug:string; name_ar:string; description?:string; is_active?:boolean; sort_order?:number; created_at?:string; updated_at?:string }
        Update: Partial<Database["public"]["Tables"]["specialties"]["Insert"]>
        Relationships: []
      }
      doctors: {
        Row: {
          id:string; slug:string; display_name:string; profile_kind:"fictional_demo"|"real_provider";
          specialty_id:string; bio:string; languages:string[]; interests:string[]; image_path:string|null;
          image_alt:string; verification_status:string; publication_status:"draft"|"review"|"published"|"archived";
          revision:number; published_at:string|null; created_by:string|null; updated_by:string|null;
          provider_user_id:string|null; created_at:string; updated_at:string
        }
        Insert: {
          id?:string; slug:string; display_name:string; profile_kind?:"fictional_demo"|"real_provider";
          specialty_id:string; bio:string; languages?:string[]; interests?:string[]; image_path?:string|null;
          image_alt?:string; verification_status?:string; publication_status?:"draft"|"review"|"published"|"archived";
          revision?:number; published_at?:string|null; created_by?:string|null; updated_by?:string|null;
          provider_user_id?:string|null; created_at?:string; updated_at?:string
        }
        Update: Partial<Database["public"]["Tables"]["doctors"]["Insert"]>
        Relationships: []
      }
      consultations: {
        Row: {
          id:string; patient_id:string; doctor_id:string|null; specialty_id:string; subject:string; body:string;
          status:ConsultationStatus; emergency_flag:boolean; closed_at:string|null; created_at:string; updated_at:string
        }
        Insert: {
          id?:string; patient_id:string; doctor_id?:string|null; specialty_id:string; subject:string; body:string;
          status?:ConsultationStatus; emergency_flag?:boolean; closed_at?:string|null; created_at?:string; updated_at?:string
        }
        Update: Partial<Database["public"]["Tables"]["consultations"]["Insert"]>
        Relationships: []
      }
      consultation_messages: {
        Row: { id:string; consultation_id:string; sender_id:string; sender_kind:"patient"|"doctor"|"staff"; body:string; created_at:string }
        Insert: { id?:string; consultation_id:string; sender_id:string; sender_kind:"patient"|"doctor"|"staff"; body:string; created_at?:string }
        Update: { body?:string }
        Relationships: []
      }
      consultation_ratings: {
        Row: { consultation_id:string; patient_id:string; rating:number; comment:string|null; created_at:string; updated_at:string }
        Insert: { consultation_id:string; patient_id:string; rating:number; comment?:string|null; created_at?:string; updated_at?:string }
        Update: { rating?:number; comment?:string|null; updated_at?:string }
        Relationships: []
      }
      consultation_payments: {
        Row: { consultation_id:string; patient_id:string; amount:number; currency:string; status:PaymentStatus; provider:string|null; provider_reference:string|null; created_at:string; updated_at:string }
        Insert: { consultation_id:string; patient_id:string; amount?:number; currency?:string; status?:PaymentStatus; provider?:string|null; provider_reference?:string|null; created_at?:string; updated_at?:string }
        Update: { amount?:number; currency?:string; status?:PaymentStatus; provider?:string|null; provider_reference?:string|null; updated_at?:string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      can_access_consultation: { Args:{ target:string }; Returns:boolean }
    }
    Enums: {
      app_role: AppRole
      account_status: AccountStatus
      consultation_status: ConsultationStatus
      message_sender_kind: "patient"|"doctor"|"staff"
      payment_status: PaymentStatus
    }
    CompositeTypes: Record<string, never>
  }
}
