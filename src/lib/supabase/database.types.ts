export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'user' | 'business_owner' | 'admin'
          is_active: boolean
          onboarding_completed: boolean
          city: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'user' | 'business_owner' | 'admin'
          is_active?: boolean
          onboarding_completed?: boolean
          city?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'user' | 'business_owner' | 'admin'
          is_active?: boolean
          onboarding_completed?: boolean
          city?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      business_categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          description: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'business_categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'business_categories'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category_id: string | null
          logo_url: string | null
          cover_url: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          website: string | null
          address: string | null
          city: string | null
          neighborhood: string | null
          latitude: number | null
          longitude: number | null
          is_verified: boolean
          is_active: boolean
          is_featured: boolean
          subscription_tier: 'free' | 'basic' | 'pro' | 'premium'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          logo_url?: string | null
          cover_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean
          is_active?: boolean
          is_featured?: boolean
          subscription_tier?: 'free' | 'basic' | 'pro' | 'premium'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          logo_url?: string | null
          cover_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean
          is_active?: boolean
          is_featured?: boolean
          subscription_tier?: 'free' | 'basic' | 'pro' | 'premium'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'businesses_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'business_categories'
            referencedColumns: ['id']
          },
        ]
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Update: {
          id?: string
          business_id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'business_hours_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      ads: {
        Row: {
          id: string
          business_id: string
          owner_id: string
          type: 'banner' | 'featured' | 'promotion'
          status: 'draft' | 'pending_review' | 'active' | 'paused' | 'expired' | 'rejected'
          title: string
          description: string | null
          image_url: string | null
          cta_text: string | null
          cta_url: string | null
          target_categories: string[] | null
          target_neighborhoods: string[] | null
          target_cities: string[] | null
          schedule_start: string | null
          schedule_end: string | null
          daily_start_hour: number | null
          daily_end_hour: number | null
          budget_type: 'free' | 'basic' | 'pro' | 'premium'
          priority: number
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          type: 'banner' | 'featured' | 'promotion'
          status?: 'draft' | 'pending_review' | 'active' | 'paused' | 'expired' | 'rejected'
          title: string
          description?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          target_categories?: string[] | null
          target_neighborhoods?: string[] | null
          target_cities?: string[] | null
          schedule_start?: string | null
          schedule_end?: string | null
          daily_start_hour?: number | null
          daily_end_hour?: number | null
          budget_type?: 'free' | 'basic' | 'pro' | 'premium'
          priority?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          type?: 'banner' | 'featured' | 'promotion'
          status?: 'draft' | 'pending_review' | 'active' | 'paused' | 'expired' | 'rejected'
          title?: string
          description?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          target_categories?: string[] | null
          target_neighborhoods?: string[] | null
          target_cities?: string[] | null
          schedule_start?: string | null
          schedule_end?: string | null
          daily_start_hour?: number | null
          daily_end_hour?: number | null
          budget_type?: 'free' | 'basic' | 'pro' | 'premium'
          priority?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ads_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ads_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ad_impressions: {
        Row: {
          id: string
          ad_id: string
          viewer_id: string | null
          viewer_ip: string | null
          context: 'feed' | 'explorer' | 'business_profile' | 'search' | null
          created_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          viewer_id?: string | null
          viewer_ip?: string | null
          context?: 'feed' | 'explorer' | 'business_profile' | 'search' | null
          created_at?: string
        }
        Update: {
          id?: string
          ad_id?: string
          viewer_id?: string | null
          viewer_ip?: string | null
          context?: 'feed' | 'explorer' | 'business_profile' | 'search' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ad_impressions_ad_id_fkey'
            columns: ['ad_id']
            isOneToOne: false
            referencedRelation: 'ads'
            referencedColumns: ['id']
          },
        ]
      }
      ad_clicks: {
        Row: {
          id: string
          ad_id: string
          impression_id: string | null
          viewer_id: string | null
          viewer_ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          impression_id?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ad_id?: string
          impression_id?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ad_clicks_ad_id_fkey'
            columns: ['ad_id']
            isOneToOne: false
            referencedRelation: 'ads'
            referencedColumns: ['id']
          },
        ]
      }
      incentives: {
        Row: {
          id: string
          business_id: string
          owner_id: string
          type: 'coupon' | 'combo' | 'reward'
          status: 'draft' | 'active' | 'paused' | 'expired' | 'depleted'
          title: string
          description: string | null
          image_url: string | null
          terms: string | null
          discount_type: 'percentage' | 'fixed_amount' | 'free_item' | null
          discount_value: number | null
          min_purchase: number | null
          code: string | null
          max_uses: number | null
          current_uses: number
          max_uses_per_user: number
          start_date: string | null
          end_date: string | null
          target_categories: string[] | null
          target_neighborhoods: string[] | null
          target_cities: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          type: 'coupon' | 'combo' | 'reward'
          status?: 'draft' | 'active' | 'paused' | 'expired' | 'depleted'
          title: string
          description?: string | null
          image_url?: string | null
          terms?: string | null
          discount_type?: 'percentage' | 'fixed_amount' | 'free_item' | null
          discount_value?: number | null
          min_purchase?: number | null
          code?: string | null
          max_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          start_date?: string | null
          end_date?: string | null
          target_categories?: string[] | null
          target_neighborhoods?: string[] | null
          target_cities?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          type?: 'coupon' | 'combo' | 'reward'
          status?: 'draft' | 'active' | 'paused' | 'expired' | 'depleted'
          title?: string
          description?: string | null
          image_url?: string | null
          terms?: string | null
          discount_type?: 'percentage' | 'fixed_amount' | 'free_item' | null
          discount_value?: number | null
          min_purchase?: number | null
          code?: string | null
          max_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          start_date?: string | null
          end_date?: string | null
          target_categories?: string[] | null
          target_neighborhoods?: string[] | null
          target_cities?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'incentives_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'incentives_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      saved_incentives: {
        Row: {
          id: string
          user_id: string
          incentive_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          incentive_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          incentive_id?: string
          saved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_incentives_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saved_incentives_incentive_id_fkey'
            columns: ['incentive_id']
            isOneToOne: false
            referencedRelation: 'incentives'
            referencedColumns: ['id']
          },
        ]
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          incentive_id: string
          business_id: string
          redemption_token: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          confirmed_at: string | null
          confirmed_by: string | null
          expires_at: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          incentive_id: string
          business_id: string
          redemption_token?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          confirmed_at?: string | null
          confirmed_by?: string | null
          expires_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          incentive_id?: string
          business_id?: string
          redemption_token?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          confirmed_at?: string | null
          confirmed_by?: string | null
          expires_at?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'redemptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'redemptions_incentive_id_fkey'
            columns: ['incentive_id']
            isOneToOne: false
            referencedRelation: 'incentives'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'redemptions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      loyalty_cards: {
        Row: {
          id: string
          user_id: string
          business_id: string
          total_stamps: number
          stamps_required: number
          rewards_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          total_stamps?: number
          stamps_required?: number
          rewards_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          total_stamps?: number
          stamps_required?: number
          rewards_earned?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loyalty_cards_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loyalty_cards_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      ai_generations: {
        Row: {
          id: string
          business_id: string
          owner_id: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          input_data: Json
          input_image_url: string | null
          output_text: string | null
          output_image_url: string | null
          output_data: Json | null
          model_used: string | null
          tokens_used: number | null
          processing_time_ms: number | null
          is_favorite: boolean
          is_used: boolean
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          input_data?: Json
          input_image_url?: string | null
          output_text?: string | null
          output_image_url?: string | null
          output_data?: Json | null
          model_used?: string | null
          tokens_used?: number | null
          processing_time_ms?: number | null
          is_favorite?: boolean
          is_used?: boolean
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          tool?: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          input_data?: Json
          input_image_url?: string | null
          output_text?: string | null
          output_image_url?: string | null
          output_data?: Json | null
          model_used?: string | null
          tokens_used?: number | null
          processing_time_ms?: number | null
          is_favorite?: boolean
          is_used?: boolean
          rating?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_generations_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_generations_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ai_usage: {
        Row: {
          id: string
          business_id: string
          owner_id: string
          month: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          usage_count: number
        }
        Insert: {
          id?: string
          business_id: string
          owner_id: string
          month: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          usage_count?: number
        }
        Update: {
          id?: string
          business_id?: string
          owner_id?: string
          month?: string
          tool?: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'ai_usage_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_usage_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ai_templates: {
        Row: {
          id: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          category_slug: string | null
          name: string
          description: string | null
          prompt_template: string
          variables: string[]
          example_output: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tool: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          category_slug?: string | null
          name: string
          description?: string | null
          prompt_template: string
          variables?: string[]
          example_output?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tool?: 'post_generator' | 'photo_enhancer' | 'promo_ideas' | 'description_generator' | 'review_responder' | 'price_assistant'
          category_slug?: string | null
          name?: string
          description?: string | null
          prompt_template?: string
          variables?: string[]
          example_output?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      ad_stats: {
        Row: {
          ad_id: string
          business_id: string
          owner_id: string
          total_impressions: number
          total_clicks: number
          ctr_percentage: number
          impressions_last_7d: number
          clicks_last_7d: number
        }
        Relationships: []
      }
      incentive_stats: {
        Row: {
          incentive_id: string
          business_id: string
          owner_id: string
          total_redemptions: number
          confirmed_redemptions: number
          pending_redemptions: number
          redemptions_last_7d: number
          total_saved: number
          max_uses: number | null
          usage_percentage: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      redeem_incentive: {
        Args: {
          p_user_id: string
          p_incentive_id: string
        }
        Returns: Json
      }
      generate_redemption_token: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
