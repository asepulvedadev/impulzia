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
      ad_clicks: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          impression_id: string | null
          viewer_id: string | null
          viewer_ip: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          impression_id?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          impression_id?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "ad_impressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string
          context: string | null
          created_at: string
          id: string
          viewer_id: string | null
          viewer_ip: string | null
        }
        Insert: {
          ad_id: string
          context?: string | null
          created_at?: string
          id?: string
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Update: {
          ad_id?: string
          context?: string | null
          created_at?: string
          id?: string
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          budget_type: string
          business_id: string
          created_at: string
          cta_text: string | null
          cta_url: string | null
          daily_end_hour: number | null
          daily_start_hour: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          metadata: Json
          owner_id: string
          priority: number
          schedule_end: string | null
          schedule_start: string | null
          status: string
          target_categories: string[] | null
          target_cities: string[] | null
          target_neighborhoods: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          budget_type?: string
          business_id: string
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          daily_end_hour?: number | null
          daily_start_hour?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json
          owner_id: string
          priority?: number
          schedule_end?: string | null
          schedule_start?: string | null
          status?: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          budget_type?: string
          business_id?: string
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          daily_end_hour?: number | null
          daily_start_hour?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata?: Json
          owner_id?: string
          priority?: number
          schedule_end?: string | null
          schedule_start?: string | null
          status?: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "ads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          business_id: string
          created_at: string
          id: string
          input_data: Json
          input_image_url: string | null
          is_favorite: boolean
          is_used: boolean
          model_used: string | null
          output_data: Json | null
          output_image_url: string | null
          output_text: string | null
          owner_id: string
          processing_time_ms: number | null
          rating: number | null
          status: string
          tokens_used: number | null
          tool: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          input_data?: Json
          input_image_url?: string | null
          is_favorite?: boolean
          is_used?: boolean
          model_used?: string | null
          output_data?: Json | null
          output_image_url?: string | null
          output_text?: string | null
          owner_id: string
          processing_time_ms?: number | null
          rating?: number | null
          status?: string
          tokens_used?: number | null
          tool: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          input_data?: Json
          input_image_url?: string | null
          is_favorite?: boolean
          is_used?: boolean
          model_used?: string | null
          output_data?: Json | null
          output_image_url?: string | null
          output_text?: string | null
          owner_id?: string
          processing_time_ms?: number | null
          rating?: number | null
          status?: string
          tokens_used?: number | null
          tool?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "ai_generations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_templates: {
        Row: {
          category_slug: string | null
          created_at: string
          description: string | null
          example_output: string | null
          id: string
          is_active: boolean
          name: string
          prompt_template: string
          sort_order: number
          tool: string
          variables: string[]
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          description?: string | null
          example_output?: string | null
          id?: string
          is_active?: boolean
          name: string
          prompt_template: string
          sort_order?: number
          tool: string
          variables?: string[]
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          description?: string | null
          example_output?: string | null
          id?: string
          is_active?: boolean
          name?: string
          prompt_template?: string
          sort_order?: number
          tool?: string
          variables?: string[]
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          business_id: string
          id: string
          month: string
          owner_id: string
          tool: string
          usage_count: number
        }
        Insert: {
          business_id: string
          id?: string
          month: string
          owner_id: string
          tool: string
          usage_count?: number
        }
        Update: {
          business_id?: string
          id?: string
          month?: string
          owner_id?: string
          tool?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "ai_usage_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_catalog_items: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          metadata: Json
          name: string
          price: number | null
          price_label: string | null
          section_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          name: string
          price?: number | null
          price_label?: string | null
          section_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          name?: string
          price?: number | null
          price_label?: string | null
          section_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_catalog_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_catalog_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_catalog_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "business_catalog_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      business_catalog_sections: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_visible: boolean
          name: string
          sort_order: number
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_catalog_sections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_catalog_sections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
        }
        Insert: {
          business_id: string
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Update: {
          business_id?: string
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          brand_color_accent: string
          brand_color_primary: string
          brand_color_secondary: string
          category_id: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          hero_slides: Json
          id: string
          is_active: boolean
          is_featured: boolean
          is_verified: boolean
          landing_visible: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          metadata: Json | null
          name: string
          neighborhood: string | null
          owner_id: string
          phone: string | null
          short_description: string | null
          slug: string
          social_links: Json
          story_content: string | null
          story_title: string | null
          subscription_tier: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          brand_color_accent?: string
          brand_color_primary?: string
          brand_color_secondary?: string
          category_id?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hero_slides?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          landing_visible?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          neighborhood?: string | null
          owner_id: string
          phone?: string | null
          short_description?: string | null
          slug: string
          social_links?: Json
          story_content?: string | null
          story_title?: string | null
          subscription_tier?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          brand_color_accent?: string
          brand_color_primary?: string
          brand_color_secondary?: string
          category_id?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hero_slides?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          landing_visible?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          neighborhood?: string | null
          owner_id?: string
          phone?: string | null
          short_description?: string | null
          slug?: string
          social_links?: Json
          story_content?: string | null
          story_title?: string | null
          subscription_tier?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incentives: {
        Row: {
          business_id: string
          code: string | null
          created_at: string
          current_uses: number
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          id: string
          image_url: string | null
          max_uses: number | null
          max_uses_per_user: number
          metadata: Json
          min_purchase: number | null
          owner_id: string
          start_date: string | null
          status: string
          target_categories: string[] | null
          target_cities: string[] | null
          target_neighborhoods: string[] | null
          terms: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          business_id: string
          code?: string | null
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          max_uses?: number | null
          max_uses_per_user?: number
          metadata?: Json
          min_purchase?: number | null
          owner_id: string
          start_date?: string | null
          status?: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          terms?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          code?: string | null
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          max_uses?: number | null
          max_uses_per_user?: number
          metadata?: Json
          min_purchase?: number | null
          owner_id?: string
          start_date?: string | null
          status?: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          terms?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incentives_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "incentives_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_cards: {
        Row: {
          business_id: string
          created_at: string
          id: string
          rewards_earned: number
          stamps_required: number
          total_stamps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          rewards_earned?: number
          stamps_required?: number
          total_stamps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          rewards_earned?: number
          stamps_required?: number
          total_stamps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "loyalty_cards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_cards_user_id_fkey"
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
          city: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          onboarding_completed: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          bg_gradient: string | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string
        }
        Insert: {
          bg_gradient?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title: string
        }
        Update: {
          bg_gradient?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          business_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          expires_at: string
          id: string
          incentive_id: string
          metadata: Json
          redemption_token: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          incentive_id: string
          metadata?: Json
          redemption_token?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          incentive_id?: string
          metadata?: Json
          redemption_token?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "redemptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_incentive_id_fkey"
            columns: ["incentive_id"]
            isOneToOne: false
            referencedRelation: "incentive_stats"
            referencedColumns: ["incentive_id"]
          },
          {
            foreignKeyName: "redemptions_incentive_id_fkey"
            columns: ["incentive_id"]
            isOneToOne: false
            referencedRelation: "incentives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_incentives: {
        Row: {
          id: string
          incentive_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          incentive_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          incentive_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_incentives_incentive_id_fkey"
            columns: ["incentive_id"]
            isOneToOne: false
            referencedRelation: "incentive_stats"
            referencedColumns: ["incentive_id"]
          },
          {
            foreignKeyName: "saved_incentives_incentive_id_fkey"
            columns: ["incentive_id"]
            isOneToOne: false
            referencedRelation: "incentives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_incentives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          city: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json
          neighborhood: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json
          neighborhood?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          neighborhood?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          affinity_score: number
          category_slug: string
          click_count: number
          last_interaction: string | null
          redemption_count: number
          updated_at: string
          user_id: string
          view_count: number
          whatsapp_count: number
        }
        Insert: {
          affinity_score?: number
          category_slug: string
          click_count?: number
          last_interaction?: string | null
          redemption_count?: number
          updated_at?: string
          user_id: string
          view_count?: number
          whatsapp_count?: number
        }
        Update: {
          affinity_score?: number
          category_slug?: string
          click_count?: number
          last_interaction?: string | null
          redemption_count?: number
          updated_at?: string
          user_id?: string
          view_count?: number
          whatsapp_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      business_similarity: {
        Row: {
          business_a: string | null
          business_b: string | null
          co_session_count: number | null
          jaccard_score: number | null
          refreshed_at: string | null
        }
        Relationships: []
      }
      business_stats: {
        Row: {
          business_id: string | null
          category_slug: string | null
          maps_clicks_7d: number | null
          neighborhood: string | null
          refreshed_at: string | null
          velocity_ratio: number | null
          views_24h: number | null
          views_30d: number | null
          views_7d: number | null
          whatsapp_clicks_7d: number | null
        }
        Relationships: []
      }
      incentive_stats: {
        Row: {
          business_id: string | null
          confirmed_redemptions: number | null
          incentive_id: string | null
          max_uses: number | null
          owner_id: string | null
          pending_redemptions: number | null
          redemptions_last_7d: number | null
          total_redemptions: number | null
          total_saved: number | null
          usage_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incentives_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_stats"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "incentives_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_heatmap: {
        Row: {
          business_views: number | null
          neighborhood: string | null
          searches: number | null
          total_events: number | null
          unique_sessions: number | null
          unique_users: number | null
          whatsapp_clicks: number | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          category_filter: string | null
          day: string | null
          neighborhood: string | null
          query: string | null
          search_count: number | null
          unique_sessions: number | null
          zero_results_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_redemption_token: { Args: never; Returns: string }
      get_business_peak_hours: {
        Args: { p_business_id: string }
        Returns: {
          event_count: number
          hour_of_day: number
        }[]
      }
      get_business_top_neighborhoods: {
        Args: { p_business_id: string; p_limit?: number }
        Returns: {
          event_count: number
          neighborhood: string
        }[]
      }
      get_personalized_scores: {
        Args: { p_category?: string; p_limit?: number; p_user_id?: string }
        Returns: {
          business_id: string
          personalization_score: number
        }[]
      }
      get_similar_businesses: {
        Args: { p_business_id: string; p_limit?: number }
        Returns: {
          business_id: string
          jaccard_score: number
          source: string
        }[]
      }
      purge_old_events: { Args: never; Returns: undefined }
      recalculate_user_affinity: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      redeem_incentive: {
        Args: { p_incentive_id: string; p_user_id: string }
        Returns: Json
      }
      refresh_all_analytics: { Args: never; Returns: undefined }
      refresh_business_similarity: { Args: never; Returns: undefined }
      refresh_business_stats: { Args: never; Returns: undefined }
      refresh_neighborhood_heatmap: { Args: never; Returns: undefined }
      refresh_search_analytics: { Args: never; Returns: undefined }
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
