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
      app_settings: {
        Row: {
          id: number
          store_delivery_fee: number
          store_free_delivery_threshold: number
          rental_delivery_fee: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          store_delivery_fee?: number
          store_free_delivery_threshold?: number
          rental_delivery_fee?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          store_delivery_fee?: number
          store_free_delivery_threshold?: number
          rental_delivery_fee?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      mango_products: {
        Row: {
          badge: Database["public"]["Enums"]["product_badge"] | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string[] | null
          name: string
          original_price: number | null
          price: number
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string | null
          variety: string
          weight_kg: number[]
        }
        Insert: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string[] | null
          name: string
          original_price?: number | null
          price: number
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string | null
          variety: string
          weight_kg?: number[] | null
        }
        Update: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string[] | null
          name?: string
          original_price?: number | null
          price?: number
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string | null
          variety?: string
          weight_kg?: number[] | null
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
          eyebrow: string
          title: string
          sub_heading: string
          description: string
          image_url: string
          button_label: string
          button_link: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          eyebrow: string
          title: string
          sub_heading: string
          description: string
          image_url: string
          button_label: string
          button_link: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          eyebrow?: string
          title?: string
          sub_heading?: string
          description?: string
          image_url?: string
          button_label?: string
          button_link?: string
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
          created_at: string
          delivery_address: Json
          id: string
          items: Json
          payment_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_id: string
          user_id: string
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
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          id: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [

        ]
      }
      rentals: {
        Row: {
          amount_paid: number
          delivery_address: Json | null
          id: string
          payment_id: string | null
          rented_at: string | null
          season: string | null
          status: Database["public"]["Enums"]["rental_status"]
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
      tree_plans: {
        Row: {
          id: string
          name: string
          badge_text: string | null
          badge_color: string | null
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          badge_text?: string | null
          badge_color?: string | null
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          badge_text?: string | null
          badge_color?: string | null
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      trees: {
        Row: {
          age_years: number
          created_at: string
          farmer_id: string
          gps_lat: number
          gps_lng: number
          id: string
          is_verified: boolean
          photos: Json
          plan_id: string
          price: number
          description: string | null
          reserved_until: string | null
          source: Database["public"]["Enums"]["tree_source"]
          status: Database["public"]["Enums"]["tree_status"]
          variety: string
          yield_max_kg: number
          yield_min_kg: number
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
          plan_id?: string | null
          price?: number | null
          description?: string | null
          reserved_until?: string | null
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
          plan_id?: string | null
          price?: number | null
          description?: string | null
          reserved_until?: string | null
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
          {
            foreignKeyName: "trees_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "tree_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_stats: {
        Args: Record<string, never>  // no arguments
        Returns: {
          users: number
          trees: number
          orders: number
          order_revenue: number
          rental_revenue: number
        }
      }
    }
    Enums: {
      product_badge: "Pre-Order" | "Sale" | "New" | "None"
      product_status: "available" | "out_of_stock" | "pre_order"

      farmer_status: "pending" | "approved" | "rejected"
      lead_status: "new" | "contacted" | "quoted" | "closed"
      order_status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
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
      order_status: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      plan_type: ["basic", "standard", "max"],
      rental_status: ["active", "completed", "cancelled"],
      tree_source: ["own_farm", "partner"],
      tree_status: ["available", "rented", "inactive"],
      user_role: ["user", "farmer", "admin"],
    },
  },
} as const





// types to export directly
// ========================================
// TABLE ROW TYPES
// ========================================

export type MangoProduct = Database['public']['Tables']['mango_products']['Row']
export type Blog = Database['public']['Tables']['blogs']['Row']
export type CustomPlanLead = Database['public']['Tables']['custom_plan_leads']['Row']
export type HeroSlide = Database['public']['Tables']['hero_slides']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Farmer = Database['public']['Tables']['farmers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Rental = Database['public']['Tables']['rentals']['Row']
export type TreeUpdate = Database['public']['Tables']['tree_updates']['Row']
export type TreePlan = Database['public']['Tables']['tree_plans']['Row']
export type Tree = Database['public']['Tables']['trees']['Row']
export type AppSettings = Database['public']['Tables']['app_settings']['Row']

// ========================================
// TABLE INSERT TYPES
// ========================================

export type MangoProductInsert = Database['public']['Tables']['mango_products']['Insert']
export type BlogInsert = Database['public']['Tables']['blogs']['Insert']
export type CustomPlanLeadInsert = Database['public']['Tables']['custom_plan_leads']['Insert']
export type HeroSlideInsert = Database['public']['Tables']['hero_slides']['Insert']
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']
export type FarmerInsert = Database['public']['Tables']['farmers']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type RentalInsert = Database['public']['Tables']['rentals']['Insert']
export type TreeUpdateInsert = Database['public']['Tables']['tree_updates']['Insert']
export type TreePlanInsert = Database['public']['Tables']['tree_plans']['Insert']
export type TreeInsert = Database['public']['Tables']['trees']['Insert']

// ========================================
// TABLE UPDATE TYPES
// ========================================

export type MangoProductUpdate = Database['public']['Tables']['mango_products']['Update']
export type BlogUpdate = Database['public']['Tables']['blogs']['Update']
export type CustomPlanLeadUpdate = Database['public']['Tables']['custom_plan_leads']['Update']
export type HeroSlideUpdate = Database['public']['Tables']['hero_slides']['Update']
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update']
export type FarmerUpdate = Database['public']['Tables']['farmers']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type RentalUpdate = Database['public']['Tables']['rentals']['Update']
export type TreeUpdateUpdate = Database['public']['Tables']['tree_updates']['Update']
export type TreePlanUpdate = Database['public']['Tables']['tree_plans']['Update']
export type TreeUpdate_Update = Database['public']['Tables']['trees']['Update']

// ========================================
// ENUM TYPES
// ========================================

export type ProductBadge = Database['public']['Enums']['product_badge']
export type ProductStatus = Database['public']['Enums']['product_status']
export type FarmerStatus = Database['public']['Enums']['farmer_status']
export type LeadStatus = Database['public']['Enums']['lead_status']
export type OrderStatus = Database['public']['Enums']['order_status']
export type PlanType = Database['public']['Enums']['plan_type']
export type RentalStatus = Database['public']['Enums']['rental_status']
export type TreeSource = Database['public']['Enums']['tree_source']
export type TreeStatus = Database['public']['Enums']['tree_status']
export type UserRole = Database['public']['Enums']['user_role']

// ========================================
// UTILITY TYPES
// ========================================

// Generic table type helper
export type TableName = keyof Database['public']['Tables']

// Get all table row types
export type AllTableRows = {
  [K in TableName]: Database['public']['Tables'][K]['Row']
}

// Get all table insert types
export type AllTableInserts = {
  [K in TableName]: Database['public']['Tables'][K]['Insert']
}

// Get all table update types
export type AllTableUpdates = {
  [K in TableName]: Database['public']['Tables'][K]['Update']
}

// ========================================
// JSON FIELD INTERFACES
// ========================================

export interface DeliveryAddress {
  name: string;
  phone: string;
  line1: string;
  locality?: string | null;
  city: string;
  district?: string | null;
  state: string;
  pincode: string;
  country?: string | null;
}