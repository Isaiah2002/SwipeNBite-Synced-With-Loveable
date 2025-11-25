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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string
          id: string
          test_name: string
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          test_name: string
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          test_name?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_metrics: {
        Row: {
          acceptance_rate: number | null
          avg_like_ratio_at_generation: number | null
          avg_swipes_at_generation: number | null
          generation_time_ms: number | null
          id: string
          negative_feedback_count: number
          positive_feedback_count: number
          recorded_at: string
          session_id: string
          total_feedback_count: number
          user_id: string
          variant_id: string
        }
        Insert: {
          acceptance_rate?: number | null
          avg_like_ratio_at_generation?: number | null
          avg_swipes_at_generation?: number | null
          generation_time_ms?: number | null
          id?: string
          negative_feedback_count?: number
          positive_feedback_count?: number
          recorded_at?: string
          session_id: string
          total_feedback_count?: number
          user_id: string
          variant_id: string
        }
        Update: {
          acceptance_rate?: number | null
          avg_like_ratio_at_generation?: number | null
          avg_swipes_at_generation?: number | null
          generation_time_ms?: number | null
          id?: string
          negative_feedback_count?: number
          positive_feedback_count?: number
          recorded_at?: string
          session_id?: string
          total_feedback_count?: number
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_metrics_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          model: string
          system_prompt: string
          temperature: number | null
          test_name: string
          traffic_allocation: number
          updated_at: string
          variant_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          model: string
          system_prompt: string
          temperature?: number | null
          test_name: string
          traffic_allocation?: number
          updated_at?: string
          variant_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          model?: string
          system_prompt?: string
          temperature?: number | null
          test_name?: string
          traffic_allocation?: number
          updated_at?: string
          variant_name?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      liked_restaurants: {
        Row: {
          created_at: string
          cuisine: string
          deals: string | null
          description: string
          dietary: string[]
          distance: number
          estimated_time: number
          id: string
          image: string
          latitude: number | null
          longitude: number | null
          price: string
          rating: number
          restaurant_id: string
          restaurant_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cuisine: string
          deals?: string | null
          description: string
          dietary?: string[]
          distance: number
          estimated_time: number
          id?: string
          image: string
          latitude?: number | null
          longitude?: number | null
          price: string
          rating: number
          restaurant_id: string
          restaurant_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          cuisine?: string
          deals?: string | null
          description?: string
          dietary?: string[]
          distance?: number
          estimated_time?: number
          id?: string
          image?: string
          latitude?: number | null
          longitude?: number | null
          price?: string
          rating?: number
          restaurant_id?: string
          restaurant_name?: string
          user_id?: string
        }
        Relationships: []
      }
      location_history: {
        Row: {
          created_at: string
          day_of_week: number
          hour_of_day: number
          id: string
          is_commute_time: boolean | null
          latitude: number
          longitude: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          hour_of_day: number
          id?: string
          is_commute_time?: boolean | null
          latitude: number
          longitude: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          hour_of_day?: number
          id?: string
          is_commute_time?: boolean | null
          latitude?: number
          longitude?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id: string
          image?: string | null
          name: string
          price?: number | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          restaurant_id: string | null
          restaurant_name: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          restaurant_id?: string | null
          restaurant_name?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          restaurant_id?: string | null
          restaurant_name?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_instructions: string | null
          id: string
          items: Json
          restaurant_id: string
          restaurant_image: string
          restaurant_name: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_instructions?: string | null
          id?: string
          items: Json
          restaurant_id: string
          restaurant_image: string
          restaurant_name: string
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_instructions?: string | null
          id?: string
          items?: Json
          restaurant_id?: string
          restaurant_image?: string
          restaurant_name?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          analytics_consent: boolean | null
          budget_alerts_enabled: boolean | null
          city: string | null
          consent_given_at: string | null
          consent_updated_at: string | null
          created_at: string
          daily_budget: number | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          food_preferences: string[] | null
          full_name: string | null
          id: string
          location_tracking_consent: boolean | null
          max_distance_preference: number | null
          monthly_budget: number | null
          notifications_consent: boolean | null
          phone_number: string | null
          price_preference: string | null
          state: string | null
          updated_at: string
          user_id: string
          weekly_budget: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          analytics_consent?: boolean | null
          budget_alerts_enabled?: boolean | null
          city?: string | null
          consent_given_at?: string | null
          consent_updated_at?: string | null
          created_at?: string
          daily_budget?: number | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          food_preferences?: string[] | null
          full_name?: string | null
          id?: string
          location_tracking_consent?: boolean | null
          max_distance_preference?: number | null
          monthly_budget?: number | null
          notifications_consent?: boolean | null
          phone_number?: string | null
          price_preference?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          weekly_budget?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          analytics_consent?: boolean | null
          budget_alerts_enabled?: boolean | null
          city?: string | null
          consent_given_at?: string | null
          consent_updated_at?: string | null
          created_at?: string
          daily_budget?: number | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          food_preferences?: string[] | null
          full_name?: string | null
          id?: string
          location_tracking_consent?: boolean | null
          max_distance_preference?: number | null
          monthly_budget?: number | null
          notifications_consent?: boolean | null
          phone_number?: string | null
          price_preference?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          weekly_budget?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          like_ratio_at_generation: number | null
          model_used: string | null
          recommendation_cuisine: string
          recommendation_reason: string
          recommendation_title: string
          session_id: string
          total_swipes_at_generation: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          like_ratio_at_generation?: number | null
          model_used?: string | null
          recommendation_cuisine: string
          recommendation_reason: string
          recommendation_title: string
          session_id: string
          total_swipes_at_generation?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          like_ratio_at_generation?: number | null
          model_used?: string | null
          recommendation_cuisine?: string
          recommendation_reason?: string
          recommendation_title?: string
          session_id?: string
          total_swipes_at_generation?: number | null
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          created_at: string
          cuisine: string
          deals: string | null
          description: string
          dietary: string[]
          distance: number
          estimated_time: number
          google_rating: number | null
          id: string
          image: string
          last_synced_at: string | null
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          name: string
          opentable_available: boolean | null
          photos: string[] | null
          place_id: string | null
          price: string
          rating: number
          reservation_url: string | null
          review_count: number | null
          updated_at: string
          yelp_id: string | null
          yelp_rating: number | null
          yelp_url: string | null
        }
        Insert: {
          created_at?: string
          cuisine: string
          deals?: string | null
          description: string
          dietary?: string[]
          distance: number
          estimated_time: number
          google_rating?: number | null
          id: string
          image: string
          last_synced_at?: string | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name: string
          opentable_available?: boolean | null
          photos?: string[] | null
          place_id?: string | null
          price: string
          rating: number
          reservation_url?: string | null
          review_count?: number | null
          updated_at?: string
          yelp_id?: string | null
          yelp_rating?: number | null
          yelp_url?: string | null
        }
        Update: {
          created_at?: string
          cuisine?: string
          deals?: string | null
          description?: string
          dietary?: string[]
          distance?: number
          estimated_time?: number
          google_rating?: number | null
          id?: string
          image?: string
          last_synced_at?: string | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name?: string
          opentable_available?: boolean | null
          photos?: string[] | null
          place_id?: string | null
          price?: string
          rating?: number
          reservation_url?: string | null
          review_count?: number | null
          updated_at?: string
          yelp_id?: string | null
          yelp_rating?: number | null
          yelp_url?: string | null
        }
        Relationships: []
      }
      shared_restaurants: {
        Row: {
          created_at: string
          cuisine: string
          deals: string | null
          description: string
          dietary: string[]
          distance: number
          estimated_time: number
          id: string
          image: string
          latitude: number | null
          longitude: number | null
          message: string | null
          price: string
          rating: number
          recipient_id: string
          restaurant_id: string
          restaurant_name: string
          sender_id: string
          viewed: boolean
        }
        Insert: {
          created_at?: string
          cuisine: string
          deals?: string | null
          description: string
          dietary?: string[]
          distance: number
          estimated_time: number
          id?: string
          image: string
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          price: string
          rating: number
          recipient_id: string
          restaurant_id: string
          restaurant_name: string
          sender_id: string
          viewed?: boolean
        }
        Update: {
          created_at?: string
          cuisine?: string
          deals?: string | null
          description?: string
          dietary?: string[]
          distance?: number
          estimated_time?: number
          id?: string
          image?: string
          latitude?: number | null
          longitude?: number | null
          message?: string | null
          price?: string
          rating?: number
          recipient_id?: string
          restaurant_id?: string
          restaurant_name?: string
          sender_id?: string
          viewed?: boolean
        }
        Relationships: []
      }
      swipe_events: {
        Row: {
          created_at: string
          cuisine: string | null
          distance: number | null
          id: string
          price: string | null
          rating: number | null
          restaurant_id: string
          restaurant_name: string
          swipe_direction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cuisine?: string | null
          distance?: number | null
          id?: string
          price?: string | null
          rating?: number | null
          restaurant_id: string
          restaurant_name: string
          swipe_direction: string
          user_id: string
        }
        Update: {
          created_at?: string
          cuisine?: string | null
          distance?: number | null
          id?: string
          price?: string | null
          rating?: number | null
          restaurant_id?: string
          restaurant_name?: string
          swipe_direction?: string
          user_id?: string
        }
        Relationships: []
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
