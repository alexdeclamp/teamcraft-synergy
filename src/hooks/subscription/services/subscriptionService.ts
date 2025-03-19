
import { SubscriptionTier, UserSubscription, SubscriptionPlan } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { createDefaultSubscription, createDefaultUserSubscription } from '../utils/subscriptionUtils';
import { fetchPlanByType, fetchStarterPlan } from './planService';
import { getDefaultPlan } from '../utils/planUtils';
import { setupSubscriptionData } from './setupService';

// Main function to fetch user subscription and plan details
export const fetchUserSubscriptionAndPlan = async (userId: string): Promise<{
  subscription: UserSubscription | null;
  plan: SubscriptionTier | null;
  error: string | null;
}> => {
  try {
    // First ensure subscription tables are set up
    await setupSubscriptionData();
    
    // Direct query for the subscription rather than RPC to avoid any potential issues
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return {
        subscription: null,
        plan: getDefaultPlan(),
        error: 'Failed to load subscription information'
      };
    }
    
    // If no subscription found, create a default one
    if (!subscriptionData) {
      console.log('No subscription data found, creating default subscription');
      
      // Create starter subscription automatically
      const defaultSubscription = createDefaultSubscription(userId);
      
      try {
        await createDefaultUserSubscription(userId);
        console.log('Default subscription created for user', userId);
      } catch (err) {
        console.error('Error creating default subscription:', err);
      }
      
      // Get starter plan details
      const starterPlan = await fetchStarterPlan();
      
      return {
        subscription: defaultSubscription,
        plan: starterPlan || getDefaultPlan(),
        error: null
      };
    }
    
    // We have subscription data, convert to our type
    const planType = subscriptionData.plan_type as SubscriptionPlan;
    
    console.log(`Found subscription for user ${userId} with plan type: ${planType}`);
    
    const userSub: UserSubscription = {
      id: subscriptionData.id,
      user_id: userId,
      plan_type: planType,
      is_active: subscriptionData.is_active,
      trial_ends_at: subscriptionData.trial_ends_at,
      created_at: subscriptionData.created_at
    };
    
    // Get plan details
    const plan = await fetchPlanByType(userSub.plan_type);
    console.log(`Fetched plan details for ${planType}:`, plan.name);
    
    return {
      subscription: userSub,
      plan,
      error: null
    };
  } catch (err) {
    console.error('Unexpected error fetching subscription:', err);
    return {
      subscription: null,
      plan: getDefaultPlan(),
      error: 'An unexpected error occurred'
    };
  }
};
