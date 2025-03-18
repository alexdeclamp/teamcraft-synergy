
import { SubscriptionTier } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { createPlanFromData, getDefaultPlan } from '../utils/planUtils';

// Fetch starter plan details
export const fetchStarterPlan = async (): Promise<SubscriptionTier | null> => {
  const { data: starterPlan } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('plan_type', 'starter')
    .eq('is_default', true)
    .maybeSingle();
    
  if (starterPlan) {
    return createPlanFromData(starterPlan);
  }
  
  return null;
};

// Get plan details by plan type
export const fetchPlanByType = async (planType: string): Promise<SubscriptionTier> => {
  const { data: planData, error: planError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('plan_type', planType)
    .maybeSingle();
    
  if (planError) {
    console.error('Error fetching plan details:', planError);
    return getDefaultPlan();
  }
  
  if (planData) {
    return createPlanFromData(planData);
  }
  
  return getDefaultPlan();
};
