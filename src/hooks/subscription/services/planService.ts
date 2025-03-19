
import { SubscriptionTier, SubscriptionPlan } from '@/types/subscription';
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
export const fetchPlanByType = async (planType: SubscriptionPlan): Promise<SubscriptionTier> => {
  try {
    // First try to get the default plan of this type
    const { data: defaultPlan, error: defaultPlanError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', planType)
      .eq('is_default', true)
      .maybeSingle();
      
    if (!defaultPlanError && defaultPlan) {
      return createPlanFromData(defaultPlan);
    }
    
    // If no default plan found, get all plans of this type and use the first one
    const { data: plans, error: plansError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', planType);
      
    if (plansError) {
      console.error('Error fetching all plans:', plansError);
      return getDefaultPlan();
    }
    
    if (plans && plans.length > 0) {
      console.log(`Found ${plans.length} plans of type ${planType}, using the first one`);
      return createPlanFromData(plans[0]);
    }
    
    console.error(`No plans found of type: ${planType}`);
    return getDefaultPlan();
  } catch (error) {
    console.error('Error in fetchPlanByType:', error);
    return getDefaultPlan();
  }
};
