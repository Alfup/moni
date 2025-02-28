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
      crypto_data: {
        Row: {
          id: string
          planet: string
          price: number
          market_cap: number
          volume_24h: number
          change_24h: number
          rank: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          planet: string
          price: number
          market_cap: number
          volume_24h: number
          change_24h: number
          rank: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          planet?: string
          price?: number
          market_cap?: number
          volume_24h?: number
          change_24h?: number
          rank?: number
          updated_at?: string
          created_at?: string
        }
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
  }
}