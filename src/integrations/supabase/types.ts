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
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          customer_id: string
          customer_name: string | null
          customer_phone: string | null
          end_time: string | null
          hustle_id: string
          hustler_id: string
          id: string
          notes: string | null
          start_time: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          customer_id: string
          customer_name?: string | null
          customer_phone?: string | null
          end_time?: string | null
          hustle_id: string
          hustler_id: string
          id?: string
          notes?: string | null
          start_time: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          customer_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          end_time?: string | null
          hustle_id?: string
          hustler_id?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_analytics: {
        Row: {
          boost_id: string
          created_at: string
          event_type: string
          hustle_id: string
          id: string
          viewer_id: string | null
        }
        Insert: {
          boost_id: string
          created_at?: string
          event_type: string
          hustle_id: string
          id?: string
          viewer_id?: string | null
        }
        Update: {
          boost_id?: string
          created_at?: string
          event_type?: string
          hustle_id?: string
          id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_analytics_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: false
            referencedRelation: "hustle_boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_analytics_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          media_url: string | null
          message_type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          hustle_id: string | null
          id: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hustle_id?: string | null
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hustle_id?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      guarantors: {
        Row: {
          created_at: string
          guarantor_id: string
          hustler_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guarantor_id: string
          hustler_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guarantor_id?: string
          hustler_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hustle_boosts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          ends_at: string | null
          hustle_id: string
          id: string
          package_id: string
          starts_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          ends_at?: string | null
          hustle_id: string
          id?: string
          package_id: string
          starts_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          ends_at?: string | null
          hustle_id?: string
          id?: string
          package_id?: string
          starts_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hustle_boosts_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hustle_boosts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "boost_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      hustle_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      hustle_inquiries: {
        Row: {
          created_at: string
          hustle_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hustle_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          hustle_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hustle_inquiries_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      hustle_media: {
        Row: {
          created_at: string
          display_order: number | null
          hustle_id: string
          id: string
          media_type: string | null
          media_url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          hustle_id: string
          id?: string
          media_type?: string | null
          media_url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          hustle_id?: string
          id?: string
          media_type?: string | null
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "hustle_media_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      hustle_views: {
        Row: {
          hustle_id: string
          id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          hustle_id: string
          id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          hustle_id?: string
          id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hustle_views_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      hustles: {
        Row: {
          available_from: string | null
          available_to: string | null
          category_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          is_available_now: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location: string | null
          logo_url: string | null
          longitude: number | null
          price: number | null
          price_type: string | null
          title: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          is_available_now?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          price?: number | null
          price_type?: string | null
          title: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          is_available_now?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string | null
          logo_url?: string | null
          longitude?: number | null
          price?: number | null
          price_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hustles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hustle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          media_url: string | null
          message_type: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_url?: string | null
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      product_views: {
        Row: {
          id: string
          product_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          product_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          currency: string
          description: string
          hustle_id: string | null
          id: string
          is_active: boolean
          media_url: string | null
          price: number
          stock_quantity: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string
          hustle_id?: string | null
          id?: string
          is_active?: boolean
          media_url?: string | null
          price: number
          stock_quantity?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string
          description?: string
          hustle_id?: string | null
          id?: string
          is_active?: boolean
          media_url?: string | null
          price?: number
          stock_quantity?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          phone: string | null
          response_time_minutes: number | null
          updated_at: string
          user_id: string
          verification_level: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          response_time_minutes?: number | null
          updated_at?: string
          user_id: string
          verification_level?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          response_time_minutes?: number | null
          updated_at?: string
          user_id?: string
          verification_level?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          hustle_id: string
          id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hustle_id: string
          id?: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hustle_id?: string
          id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_hustles: {
        Row: {
          created_at: string
          hustle_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hustle_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hustle_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_hustles_hustle_id_fkey"
            columns: ["hustle_id"]
            isOneToOne: false
            referencedRelation: "hustles"
            referencedColumns: ["id"]
          },
        ]
      }
      scam_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          report_type: string
          reported_hustle_id: string | null
          reported_user_id: string | null
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          report_type?: string
          reported_hustle_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          report_type?: string
          reported_hustle_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          created_at: string
          flag_type: string
          flagged_by: string | null
          id: string
          is_active: boolean
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_type?: string
          flagged_by?: string | null
          id?: string
          is_active?: boolean
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          flag_type?: string
          flagged_by?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_reg_url: string | null
          created_at: string
          id: string
          id_document_url: string | null
          level: number
          phone: string | null
          selfie_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_reg_url?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          level?: number
          phone?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_reg_url?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          level?: number
          phone?: string | null
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          recipient_id: string | null
          reference: string | null
          status: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_id?: string | null
          reference?: string | null
          status?: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          recipient_id?: string | null
          reference?: string | null
          status?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance_kes: number
          balance_ngn: number
          balance_usd: number
          balance_zar: number
          created_at: string
          id: string
          is_frozen: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_kes?: number
          balance_ngn?: number
          balance_usd?: number
          balance_zar?: number
          created_at?: string
          id?: string
          is_frozen?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_kes?: number
          balance_ngn?: number
          balance_usd?: number
          balance_zar?: number
          created_at?: string
          id?: string
          is_frozen?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
