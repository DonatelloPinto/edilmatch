export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: "cliente" | "professionista";
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          provincia: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role: "cliente" | "professionista";
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          provincia?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          role?: "cliente" | "professionista";
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          provincia?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      professional_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          vat_number: string | null;
          business_address: string | null;
          business_city: string | null;
          business_provincia: string | null;
          website_url: string | null;
          services: string[];
          provinces_covered: string[] | null;
          years_experience: number | null;
          bio: string | null;
          is_verified: boolean;
          credits_remaining: number;
          subscription_plan: "free" | "pro";
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          vat_number?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_provincia?: string | null;
          website_url?: string | null;
          services?: string[];
          provinces_covered?: string[] | null;
          years_experience?: number | null;
          bio?: string | null;
          is_verified?: boolean;
          credits_remaining?: number;
          subscription_plan?: "free" | "pro";
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string | null;
          vat_number?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_provincia?: string | null;
          website_url?: string | null;
          services?: string[];
          provinces_covered?: string[] | null;
          years_experience?: number | null;
          bio?: string | null;
          is_verified?: boolean;
          credits_remaining?: number;
          subscription_plan?: "free" | "pro";
          referral_code?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          categoria: string | null;
          city: string | null;
          provincia: string | null;
          address: string | null;
          budget_min: number | null;
          budget_max: number | null;
          lat: number | null;
          lng: number | null;
          status: "open" | "in_progress" | "closed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          categoria?: string | null;
          city?: string | null;
          provincia?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          status?: "open" | "in_progress" | "closed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          categoria?: string | null;
          city?: string | null;
          provincia?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          budget_min?: number | null;
          budget_max?: number | null;
          status?: "open" | "in_progress" | "closed" | "cancelled";
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          request_id: string;
          professional_id: string;
          amount: number;
          message: string | null;
          status: "sent" | "accepted" | "rejected" | "withdrawn";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          professional_id: string;
          amount: number;
          message?: string | null;
          status?: "sent" | "accepted" | "rejected" | "withdrawn";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          message?: string | null;
          status?: "sent" | "accepted" | "rejected" | "withdrawn";
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          client_id: string;
          professional_id: string;
          request_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          professional_id: string;
          request_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          professional_id?: string;
          request_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          content?: string;
          read?: boolean;
        };
        Relationships: [];
      };
      professional_availability: {
        Row: {
          id: string;
          professional_id: string;
          date: string;
          time_slots: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          date: string;
          time_slots?: string[];
          created_at?: string;
        };
        Update: {
          time_slots?: string[];
        };
        Relationships: [];
      };
      tenders: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          budget: number | null;
          deadline: string;
          location: string | null;
          province: string | null;
          status: "open" | "closed";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          budget?: number | null;
          deadline: string;
          location?: string | null;
          province?: string | null;
          status?: "open" | "closed";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string | null;
          budget?: number | null;
          deadline?: string;
          location?: string | null;
          province?: string | null;
          status?: "open" | "closed";
        };
        Relationships: [];
      };
      tender_offers: {
        Row: {
          id: string;
          tender_id: string;
          professional_id: string;
          offer_amount: number;
          notes: string | null;
          document_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tender_id: string;
          professional_id: string;
          offer_amount: number;
          notes?: string | null;
          document_url?: string | null;
          created_at?: string;
        };
        Update: {
          offer_amount?: number;
          notes?: string | null;
          document_url?: string | null;
        };
        Relationships: [];
      };
      portfolio_projects: {
        Row: {
          id: string;
          professional_id: string;
          title: string;
          description: string | null;
          category: string | null;
          before_images: string[];
          after_images: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          before_images?: string[];
          after_images?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string | null;
          before_images?: string[];
          after_images?: string[];
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_email: string;
          status: "pending" | "completed";
          reward_credited: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_email: string;
          status?: "pending" | "completed";
          reward_credited?: boolean;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "completed";
          reward_credited?: boolean;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          request_id: string | null;
          quote_id: string | null;
          client_id: string;
          professional_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          quote_id?: string | null;
          client_id: string;
          professional_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
