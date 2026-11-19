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
    PostgrestVersion: "12.2.12"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          firstName: string | null
          id: number
          lastName: string | null
          state: string | null
          streetAddress: string | null
          zipCode: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          firstName?: string | null
          id?: number
          lastName?: string | null
          state?: string | null
          streetAddress?: string | null
          zipCode?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          firstName?: string | null
          id?: number
          lastName?: string | null
          state?: string | null
          streetAddress?: string | null
          zipCode?: string | null
        }
        Relationships: []
      }
      audiences: {
        Row: {
          business_id: number | null
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          business_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      business: {
        Row: {
          business_logo_url: string | null
          created_at: string
          email: string | null
          id: number
          name: string | null
          owner_id: string | null
        }
        Insert: {
          business_logo_url?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          business_logo_url?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          owner_id?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          business_id: number | null
          created_at: string
          customer_name: string | null
          customer_phone_id: number | null
          id: string
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          customer_name?: string | null
          customer_phone_id?: number | null
          id: string
        }
        Update: {
          business_id?: number | null
          created_at?: string
          customer_name?: string | null
          customer_phone_id?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_customer_phone_id_fkey"
            columns: ["customer_phone_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          business_id: number | null
          contact_name: string | null
          created_at: string
          id: number
          is_hidden: boolean
          is_user: boolean | null
          lid: string | null
          phone_number_id: number | null
          pushname: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          business_id?: number | null
          contact_name?: string | null
          created_at?: string
          id?: number
          is_hidden?: boolean
          is_user?: boolean | null
          lid?: string | null
          phone_number_id?: number | null
          pushname?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          business_id?: number | null
          contact_name?: string | null
          created_at?: string
          id?: number
          is_hidden?: boolean
          is_user?: boolean | null
          lid?: string | null
          phone_number_id?: number | null
          pushname?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: number
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          business_id: number | null
          category_id: number | null
          created_at: string
          description: string | null
          expense_date: string | null
          id: number
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount?: number | null
          business_id?: number | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          expense_date?: string | null
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number | null
          business_id?: number | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          expense_date?: string | null
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          business_id: number
          created_at: string
          id: string
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: string
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: string
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_paid: number | null
          business_id: number | null
          contact_id: number | null
          created_at: string
          id: number
          notes: string | null
          order_number: number
          payment_method: string | null
          payment_status: string | null
          refunded_amount: number | null
          shipping_address: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          business_id?: number | null
          contact_id?: number | null
          created_at?: string
          id?: number
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_status?: string | null
          refunded_amount?: number | null
          shipping_address?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          business_id?: number | null
          contact_id?: number | null
          created_at?: string
          id?: number
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_status?: string | null
          refunded_amount?: number | null
          shipping_address?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_products: {
        Row: {
          created_at: string
          id: string
          order_id: number | null
          product_id: string | null
          quantity: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: number | null
          product_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: number | null
          product_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          created_at: string
          id: number
          phone_number: string
        }
        Insert: {
          created_at?: string
          id?: number
          phone_number: string
        }
        Update: {
          created_at?: string
          id?: number
          phone_number?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          business_id: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string | null
          price: number | null
          stock: number | null
          whatsapp_product_id: string | null
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          price?: number | null
          stock?: number | null
          whatsapp_product_id?: string | null
        }
        Update: {
          business_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          price?: number | null
          stock?: number | null
          whatsapp_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          country: string | null
          created_at: string
          email: string | null
          last_name: string | null
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          business_id: number | null
          created_at: string
          cron_expression: string | null
          description: string | null
          enabled: boolean | null
          frequency_type: string | null
          id: number
          last_run_at: string | null
          name: string
          next_run_at: string | null
          payload: Json | null
          run_at: string | null
          task_type: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          cron_expression?: string | null
          description?: string | null
          enabled?: boolean | null
          frequency_type?: string | null
          id?: number
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          payload?: Json | null
          run_at?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: number | null
          created_at?: string
          cron_expression?: string | null
          description?: string | null
          enabled?: boolean | null
          frequency_type?: string | null
          id?: number
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          payload?: Json | null
          run_at?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      "whatsapp-containers": {
        Row: {
          business_id: number
          container_id: string | null
          created_at: string
          phone_id: number | null
          qr_code_updated_at: string | null
          qr_code_url: string | null
          status: string | null
        }
        Insert: {
          business_id?: number
          container_id?: string | null
          created_at?: string
          phone_id?: number | null
          qr_code_updated_at?: string | null
          qr_code_url?: string | null
          status?: string | null
        }
        Update: {
          business_id?: number
          container_id?: string | null
          created_at?: string
          phone_id?: number | null
          qr_code_updated_at?: string | null
          qr_code_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp-containers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp-containers_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
