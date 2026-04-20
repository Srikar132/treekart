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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      mango_products: {
        Row: {
          badge: Database["public"]["Enums"]["product_badge"] | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          original_price: number | null
          price: number
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string | null
          variety: string
          weight_kg: number | null
        }
        Insert: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          original_price?: number | null
          price: number
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string | null
          variety: string
          weight_kg?: number | null
        }
        Update: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string | null
          variety?: string
          weight_kg?: number | null
        }
        Relationships: []
      }

      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_image: string | null
          author: string | null
          category: string | null
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          author?: string | null
          category?: string | null
          published_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          cover_image?: string | null
          author?: string | null
          category?: string | null
          published_at?: string
          created_at?: string
        }
        Relationships: []
      }

      custom_plan_leads: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tree_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tree_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tree_count?: number | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          cta_text: string | null
          cta_link: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          cta_text?: string | null
          cta_link?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          cta_text?: string | null
          cta_link?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string | null
          content: string
          avatar_url: string | null
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          content: string
          avatar_url?: string | null
          rating?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          content?: string
          avatar_url?: string | null
          rating?: number
          created_at?: string
        }
        Relationships: []
      }
      farmers: {
        Row: {
          commission_pct: number | null
          created_at: string | null
          documents: Json | null
          farm_name: string | null
          farm_size_acres: number | null
          id: string
          is_organic: boolean | null
          location: string | null
          profile_id: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["farmer_status"] | null
        }
        Insert: {
          commission_pct?: number | null
          created_at?: string | null
          documents?: Json | null
          farm_name?: string | null
          farm_size_acres?: number | null
          id?: string
          is_organic?: boolean | null
          location?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
        }
        Update: {
          commission_pct?: number | null
          created_at?: string | null
          documents?: Json | null
          farm_name?: string | null
          farm_size_acres?: number | null
          id?: string
          is_organic?: boolean | null
          location?: string | null
          profile_id?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: Json | null
          id: string
          items: Json | null
          payment_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
          tracking_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: Json | null
          id?: string
          items?: Json | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          tracking_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: Json | null
          id?: string
          items?: Json | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          tracking_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          is_verified: boolean | null
          full_name: string | null
          phone: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          id: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          id?: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [

        ]
      }
      rentals: {
        Row: {
          amount_paid: number | null
          delivery_address: Json | null
          id: string
          payment_id: string | null
          rented_at: string | null
          season: string | null
          status: Database["public"]["Enums"]["rental_status"] | null
          tree_id: string | null
          user_id: string | null
          visit_requested: boolean | null
        }
        Insert: {
          amount_paid?: number | null
          delivery_address?: Json | null
          id?: string
          payment_id?: string | null
          rented_at?: string | null
          season?: string | null
          status?: Database["public"]["Enums"]["rental_status"] | null
          tree_id?: string | null
          user_id?: string | null
          visit_requested?: boolean | null
        }
        Update: {
          amount_paid?: number | null
          delivery_address?: Json | null
          id?: string
          payment_id?: string | null
          rented_at?: string | null
          season?: string | null
          status?: Database["public"]["Enums"]["rental_status"] | null
          tree_id?: string | null
          user_id?: string | null
          visit_requested?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rentals_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "trees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tree_updates: {
        Row: {
          description: string | null
          id: string
          mux_asset_id: string | null
          photos: Json | null
          posted_at: string | null
          rental_id: string | null
          title: string | null
          tree_id: string | null
          video_url: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          mux_asset_id?: string | null
          photos?: Json | null
          posted_at?: string | null
          rental_id?: string | null
          title?: string | null
          tree_id?: string | null
          video_url?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          mux_asset_id?: string | null
          photos?: Json | null
          posted_at?: string | null
          rental_id?: string | null
          title?: string | null
          tree_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tree_updates_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tree_updates_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "trees"
            referencedColumns: ["id"]
          },
        ]
      }
      trees: {
        Row: {
          age_years: number | null
          created_at: string | null
          farmer_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          is_verified: boolean | null
          photos: Json | null
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          price: number | null
          description: string | null
          source: Database["public"]["Enums"]["tree_source"] | null
          status: Database["public"]["Enums"]["tree_status"] | null
          variety: string | null
          yield_max_kg: number | null
          yield_min_kg: number | null
        }
        Insert: {
          age_years?: number | null
          created_at?: string | null
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_verified?: boolean | null
          photos?: Json | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          price?: number | null
          description?: string | null
          source?: Database["public"]["Enums"]["tree_source"] | null
          status?: Database["public"]["Enums"]["tree_status"] | null
          variety?: string | null
          yield_max_kg?: number | null
          yield_min_kg?: number | null
        }
        Update: {
          age_years?: number | null
          created_at?: string | null
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_verified?: boolean | null
          photos?: Json | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          price?: number | null
          description?: string | null
          source?: Database["public"]["Enums"]["tree_source"] | null
          status?: Database["public"]["Enums"]["tree_status"] | null
          variety?: string | null
          yield_max_kg?: number | null
          yield_min_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trees_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
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
      product_badge: "Pre-Order" | "Sale" | "New" | "None"
      product_status: "available" | "out_of_stock" | "pre_order"

      farmer_status: "pending" | "approved" | "rejected"
      lead_status: "new" | "contacted" | "quoted" | "closed"
      order_status: "pending" | "confirmed" | "shipped" | "delivered"
      plan_type: "basic" | "standard" | "max"
      rental_status: "active" | "completed" | "cancelled"
      tree_source: "own_farm" | "partner"
      tree_status: "available" | "rented" | "inactive"
      user_role: "user" | "farmer" | "admin"
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
      farmer_status: ["pending", "approved", "rejected"],
      lead_status: ["new", "contacted", "quoted", "closed"],
      order_status: ["pending", "confirmed", "shipped", "delivered"],
      plan_type: ["basic", "standard", "max"],
      rental_status: ["active", "completed", "cancelled"],
      tree_source: ["own_farm", "partner"],
      tree_status: ["available", "rented", "inactive"],
      user_role: ["user", "farmer", "admin"],
    },
  },
} as const
