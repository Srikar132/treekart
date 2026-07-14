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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: number
          rental_delivery_fee: number
          store_delivery_fee: number
          store_free_delivery_threshold: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          rental_delivery_fee?: number
          store_delivery_fee?: number
          store_free_delivery_threshold?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          rental_delivery_fee?: number
          store_delivery_fee?: number
          store_free_delivery_threshold?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          title?: string
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
      hero_slides: {
        Row: {
          button_label: string | null
          button_link: string | null
          created_at: string
          description: string | null
          eyebrow: string | null
          id: string
          image_url: string
          order_index: number | null
          sub_heading: string | null
          title: string
        }
        Insert: {
          button_label?: string | null
          button_link?: string | null
          created_at?: string
          description?: string | null
          eyebrow?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          sub_heading?: string | null
          title: string
        }
        Update: {
          button_label?: string | null
          button_link?: string | null
          created_at?: string
          description?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          sub_heading?: string | null
          title?: string
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
          weight_kg?: number[]
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
          weight_kg?: number[]
        }
        Relationships: []
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
          created_at?: string
          delivery_address?: Json
          id?: string
          items?: Json
          payment_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: Json
          id?: string
          items?: Json
          payment_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_id?: string
          user_id?: string
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
      phone_migration_report: {
        Row: {
          id: number
          normalized: string | null
          profile_id: string | null
          raw_phone: string | null
          reason: string | null
          reported_at: string | null
        }
        Insert: {
          id?: number
          normalized?: string | null
          profile_id?: string | null
          raw_phone?: string | null
          reason?: string | null
          reported_at?: string | null
        }
        Update: {
          id?: number
          normalized?: string | null
          profile_id?: string | null
          raw_phone?: string | null
          reason?: string | null
          reported_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      rentals: {
        Row: {
          amount_paid: number
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
          amount_paid?: number
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
          amount_paid?: number
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
      testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          name: string
          rating: number
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          rating?: number
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          role?: string | null
        }
        Relationships: []
      }
      tree_plans: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          created_at: string
          features: Json
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
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
          age_years: number
          created_at: string | null
          description: string
          farmer_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          is_verified: boolean
          photos: Json
          plan_id: string | null
          price: number
          reserved_until: string | null
          source: Database["public"]["Enums"]["tree_source"]
          status: Database["public"]["Enums"]["tree_status"]
          variety: string
          yield_max_kg: number
          yield_min_kg: number
        }
        Insert: {
          age_years?: number
          created_at?: string | null
          description: string
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_verified?: boolean
          photos?: Json
          plan_id?: string | null
          price?: number
          reserved_until?: string | null
          source?: Database["public"]["Enums"]["tree_source"]
          status?: Database["public"]["Enums"]["tree_status"]
          variety: string
          yield_max_kg?: number
          yield_min_kg?: number
        }
        Update: {
          age_years?: number
          created_at?: string | null
          description?: string
          farmer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_verified?: boolean
          photos?: Json
          plan_id?: string | null
          price?: number
          reserved_until?: string | null
          source?: Database["public"]["Enums"]["tree_source"]
          status?: Database["public"]["Enums"]["tree_status"]
          variety?: string
          yield_max_kg?: number
          yield_min_kg?: number
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
      confirm_order_by_order_id: {
        Args: { p_rzp_order_id: string; p_rzp_payment_id: string }
        Returns: {
          order_id: string
          total_amount: number
          user_email: string
          user_name: string
        }[]
      }
      fulfil_rental: {
        Args: {
          p_rental_id: string
          p_reserved_until: string
          p_rzp_payment_id: string
          p_tree_id: string
        }
        Returns: boolean
      }
      fulfil_rental_by_order_id: {
        Args: { p_rzp_order_id: string; p_rzp_payment_id: string }
        Returns: {
          amount_paid: number
          rental_id: string
          season: string
          tree_id: string
          user_email: string
          user_name: string
        }[]
      }
      get_admin_stats: { Args: never; Returns: Json }
      normalize_in_phone: { Args: { raw: string }; Returns: string }
    }
    Enums: {
      farmer_status: "pending" | "approved" | "rejected"
      lead_status: "new" | "contacted" | "quoted" | "closed"
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_badge: "Pre-Order" | "Sale" | "New" | "None"
      product_status: "available" | "out_of_stock" | "pre_order"
      rental_status: "pending" | "active" | "completed" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      farmer_status: ["pending", "approved", "rejected"],
      lead_status: ["new", "contacted", "quoted", "closed"],
      order_status: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_badge: ["Pre-Order", "Sale", "New", "None"],
      product_status: ["available", "out_of_stock", "pre_order"],
      rental_status: ["pending", "active", "completed", "cancelled"],
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
export type RentalStatus = Database['public']['Enums']['rental_status']
export type TreeSource = Database['public']['Enums']['tree_source']
export type TreeStatus = Database['public']['Enums']['tree_status']
export type UserRole = Database['public']['Enums']['user_role']

// ========================================
// UTILITY TYPES
// ========================================

export type TableName = keyof Database['public']['Tables']

export type AllTableRows = {
  [K in TableName]: Database['public']['Tables'][K]['Row']
}

export type AllTableInserts = {
  [K in TableName]: Database['public']['Tables'][K]['Insert']
}

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
