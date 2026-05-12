export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credential_requests: {
        Row: {
          created_at: string
          credential_type: string
          description: string | null
          id: string
          issuer_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["request_status"]
          student_appar_id: string
          student_email: string
          student_full_name: string
          student_id: string
          student_phone: string
          student_roll_number: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_type?: string
          description?: string | null
          id?: string
          issuer_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_appar_id: string
          student_email: string
          student_full_name: string
          student_id: string
          student_phone: string
          student_roll_number: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          description?: string | null
          id?: string
          issuer_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_appar_id?: string
          student_email?: string
          student_full_name?: string
          student_id?: string
          student_phone?: string
          student_roll_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          certificate_file_url: string | null
          created_at: string
          credential_type: string
          description: string | null
          expiry_date: string | null
          id: string
          issued_date: string
          issuer_id: string | null
          issuer_name: string
          metadata: Json | null
          student_appar_id: string
          student_email: string | null
          student_full_name: string
          student_phone: string
          student_roll_number: string
          title: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          certificate_file_url?: string | null
          created_at?: string
          credential_type?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string
          issuer_id?: string | null
          issuer_name: string
          metadata?: Json | null
          student_appar_id: string
          student_email?: string | null
          student_full_name: string
          student_phone: string
          student_roll_number: string
          title: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          certificate_file_url?: string | null
          created_at?: string
          credential_type?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string
          issuer_id?: string | null
          issuer_name?: string
          metadata?: Json | null
          student_appar_id?: string
          student_email?: string | null
          student_full_name?: string
          student_phone?: string
          student_roll_number?: string
          title?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      institution_logos: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      otp_audit_log: {
        Row: {
          attempts: number | null
          created_at: string
          email: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          outcome: string
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          email?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          outcome: string
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          outcome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          appar_id: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          institute_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          appar_id?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          institute_name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          appar_id?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          institute_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: number
          updated_at: string
          visitor_count: number
        }
        Insert: {
          id?: number
          updated_at?: string
          visitor_count?: number
        }
        Update: {
          id?: number
          updated_at?: string
          visitor_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_credential: { Args: { _id: string }; Returns: undefined }
      admin_get_logged_in_students: {
        Args: never
        Returns: {
          appar_id: string
          email: string
          full_name: string
          last_sign_in_at: string
          phone: string
          user_id: string
        }[]
      }
      admin_get_overview: {
        Args: never
        Returns: {
          total_certs: number
          total_companies: number
          total_institutes: number
          total_students: number
          total_users: number
          verified_certs: number
        }[]
      }
      admin_list_credentials: {
        Args: never
        Returns: {
          credential_type: string
          id: string
          issued_date: string
          issuer_name: string
          student_email: string
          student_full_name: string
          title: string
          verification_status: string
        }[]
      }
      admin_list_profiles: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          address: string
          appar_id: string
          company_name: string
          created_at: string
          email: string
          full_name: string
          institute_name: string
          last_sign_in_at: string
          phone: string
          status: Database["public"]["Enums"]["user_status"]
          user_id: string
          website: string
        }[]
      }
      admin_update_user_status: {
        Args: {
          _status: Database["public"]["Enums"]["user_status"]
          _user_id: string
        }
        Returns: undefined
      }
      find_student_user_id: {
        Args: { _appar_id: string; _email: string }
        Returns: string
      }
      get_admin_counts: {
        Args: never
        Returns: {
          total_certs: number
          total_users: number
          verified_certs: number
        }[]
      }
      get_cert_issuance: {
        Args: never
        Returns: {
          issued: number
          month: string
        }[]
      }
      get_my_credentials_with_issuer: {
        Args: never
        Returns: {
          certificate_file_url: string
          credential_type: string
          description: string
          expiry_date: string
          id: string
          issued_date: string
          issuer_appar_id: string
          issuer_email: string
          issuer_full_name: string
          issuer_id: string
          issuer_institute_name: string
          issuer_name: string
          title: string
          verification_status: string
        }[]
      }
      get_status_distribution: {
        Args: never
        Returns: {
          name: string
          value: number
        }[]
      }
      get_user_growth: {
        Args: never
        Returns: {
          month: string
          users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_visitor_count: { Args: never; Returns: number }
      verify_credential: {
        Args: { _credential_id: string }
        Returns: {
          credential_type: string
          expiry_date: string
          id: string
          issued_date: string
          issuer_name: string
          student_full_name: string
          title: string
          verification_status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "student" | "institute" | "company"
      request_status: "pending" | "approved" | "rejected" | "issued"
      user_role: "student" | "institute" | "company"
      user_status: "pending" | "active" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student", "institute", "company"],
      request_status: ["pending", "approved", "rejected", "issued"],
      user_role: ["student", "institute", "company"],
      user_status: ["pending", "active", "suspended"],
    },
  },
} as const
