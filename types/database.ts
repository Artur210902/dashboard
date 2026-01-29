export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: 'basic' | 'pro' | 'enterprise' | null
          subscription_status: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: 'basic' | 'pro' | 'enterprise' | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_tier?: 'basic' | 'pro' | 'enterprise' | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      competitors: {
        Row: {
          id: string
          user_id: string
          name: string
          website_url: string
          price_selector: string
          name_selector: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          website_url: string
          price_selector: string
          name_selector?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          website_url?: string
          price_selector?: string
          name_selector?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          sku: string | null
          target_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sku?: string | null
          target_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sku?: string | null
          target_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      product_competitors: {
        Row: {
          id: string
          product_id: string
          competitor_id: string
          product_url: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          competitor_id: string
          product_url: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          competitor_id?: string
          product_url?: string
          created_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          competitor_id: string
          price: number
          currency: string
          scraped_at: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          competitor_id: string
          price: number
          currency?: string
          scraped_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          competitor_id?: string
          price?: number
          currency?: string
          scraped_at?: string
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          competitor_id: string | null
          alert_type: 'price_drop' | 'price_increase' | 'target_reached'
          threshold: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          competitor_id?: string | null
          alert_type: 'price_drop' | 'price_increase' | 'target_reached'
          threshold?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          competitor_id?: string | null
          alert_type?: 'price_drop' | 'price_increase' | 'target_reached'
          threshold?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      alert_logs: {
        Row: {
          id: string
          alert_id: string
          message: string
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          message: string
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          message?: string
          sent_at?: string
          created_at?: string
        }
      }
    }
  }
}
