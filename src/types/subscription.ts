
import type { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type to include our user_subscriptions table
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'free' | 'pro';
          is_active: boolean;
          trial_ends_at: string | null;
          current_period_starts_at: string;
          current_period_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: 'free' | 'pro';
          is_active?: boolean;
          trial_ends_at?: string | null;
          current_period_starts_at?: string;
          current_period_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'free' | 'pro';
          is_active?: boolean;
          trial_ends_at?: string | null;
          current_period_starts_at?: string;
          current_period_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    } & OriginalDatabase['public']['Tables'];
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Export a type for the subscription
export type UserSubscription = ExtendedDatabase['public']['Tables']['user_subscriptions']['Row'];

// Export utility types that can be used for working with subscriptions
export type SubscriptionPlan = 'free' | 'pro';

export interface AccountLimits {
  maxBrains: number;
  maxApiCalls: number;
}

export const getAccountLimits = (plan: SubscriptionPlan): AccountLimits => {
  switch (plan) {
    case 'pro':
      return {
        maxBrains: Infinity,
        maxApiCalls: Infinity
      };
    case 'free':
    default:
      return {
        maxBrains: 5,
        maxApiCalls: 50
      };
  }
};
