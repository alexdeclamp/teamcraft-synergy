
import { SubscriptionPlan, SubscriptionTier } from '@/types/subscription';
import { convertJsonToStringArray } from '@/types/subscription.utils';

// Helper function to get default plan as fallback
export const getDefaultPlan = (): SubscriptionTier => ({
  id: 'default',
  name: 'Starter',
  plan_type: 'starter',
  price: 0,
  max_api_calls: 25,
  max_brains: 3,
  max_documents: 9999,
  features: ['Create up to 3 brains', '25 AI API calls per month', 'Document uploads', 'Image analysis'],
  is_default: true
});

// Helper to create a plan object from database data
export const createPlanFromData = (planData: any): SubscriptionTier => ({
  id: planData.id,
  name: planData.name,
  plan_type: planData.plan_type as SubscriptionPlan,
  price: planData.price,
  max_api_calls: planData.max_api_calls,
  max_brains: planData.max_brains,
  max_documents: planData.max_documents,
  features: convertJsonToStringArray(planData.features),
  is_default: planData.is_default
});
