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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string | null
          date: string | null
          google_event_id: string | null
          id: string
          meet_link: string | null
          status: string | null
          team: string | null
          time: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          date?: string | null
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          status?: string | null
          team?: string | null
          time?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          date?: string | null
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          status?: string | null
          team?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          attempt_number: number | null
          client_id: string | null
          client_name: string | null
          duration: number | null
          id: string
          phone: string | null
          result: string | null
          started_at: string | null
          team: string | null
          transcript: string | null
        }
        Insert: {
          attempt_number?: number | null
          client_id?: string | null
          client_name?: string | null
          duration?: number | null
          id?: string
          phone?: string | null
          result?: string | null
          started_at?: string | null
          team?: string | null
          transcript?: string | null
        }
        Update: {
          attempt_number?: number | null
          client_id?: string | null
          client_name?: string | null
          duration?: number | null
          id?: string
          phone?: string | null
          result?: string | null
          started_at?: string | null
          team?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          contact_attempts: number | null
          created_at: string | null
          email: string | null
          id: string
          last_contact_at: string | null
          max_attempts: number | null
          name: string | null
          phone: string | null
          status: string | null
          team: string | null
        }
        Insert: {
          company?: string | null
          contact_attempts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          max_attempts?: number | null
          name?: string | null
          phone?: string | null
          status?: string | null
          team?: string | null
        }
        Update: {
          company?: string | null
          contact_attempts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          max_attempts?: number | null
          name?: string | null
          phone?: string | null
          status?: string | null
          team?: string | null
        }
        Relationships: []
      }
      google_tokens: {
        Row: {
          access_token: string | null
          created_at: string | null
          expiry: string | null
          id: string
          refresh_token: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expiry?: string | null
          id?: string
          refresh_token?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expiry?: string | null
          id?: string
          refresh_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          calendar_id: string
          color: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          calendar_id?: string
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          calendar_id?: string
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string
          direction: string
          id: string
          message_text: string
          phone: string
          team_slug: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_text?: string
          phone: string
          team_slug?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_text?: string
          phone?: string
          team_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
