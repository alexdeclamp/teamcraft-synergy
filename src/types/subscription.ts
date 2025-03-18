
export type SubscriptionPlan = 'starter' | 'pro';

export interface SubscriptionTier {
  id: string;
  name: string;
  plan_type: SubscriptionPlan;
  price: number;
  max_api_calls: number;
  max_brains: number;
  max_documents: number;
  features: string[];
  is_default: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
}
