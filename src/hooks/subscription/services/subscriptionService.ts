
import { SubscriptionTier, UserSubscription } from '@/types/subscription';
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
    
    // Use the RPC function to get the user's subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .rpc('get_user_subscription', { p_user_id: userId });

    if (subscriptionError) {
      // Handle RPC error with direct query fallback
      return await handleDirectFallbackQuery(userId);
    }
    
    // Handle subscription data from RPC
    return await processSubscriptionData(subscriptionData, userId);
    
  } catch (err) {
    console.error('Error in fetchUserSubscriptionAndPlan:', err);
    return {
      subscription: null,
      plan: getDefaultPlan(),
      error: 'An unexpected error occurred'
    };
  }
};

// Process the RPC result
const processSubscriptionData = async (
  subscriptionData: any,
  userId: string
): Promise<{
  subscription: UserSubscription | null;
  plan: SubscriptionTier | null;
  error: string | null;
}> => {
  // Handle both array and object responses from RPC
  const subData = Array.isArray(subscriptionData) 
    ? (subscriptionData.length > 0 ? subscriptionData[0] : null) 
    : subscriptionData;
  
  if (!subData) {
    console.log('No subscription data found, will create one');
    // Handle the case where user has no subscription yet - find starter plan
    const starterPlan = await fetchStarterPlan();
      
    if (starterPlan) {
      // Create starter subscription automatically
      await supabase.rpc('create_user_subscription', {
        p_user_id: userId,
        p_plan_type: 'starter'
      });
      
      // Return default values while the subscription is being created
      return {
        subscription: createDefaultSubscription(userId),
        plan: getDefaultPlan(),
        error: null
      };
    } else {
      // If no starter plan found, just set a default in the UI
      return {
        subscription: createDefaultSubscription(userId),
        plan: getDefaultPlan(),
        error: null
      };
    }
  }
  
  // We have subscription data, convert to our type
  const userSub: UserSubscription = {
    id: subData.id,
    user_id: userId,
    plan_type: subData.plan_type,
    is_active: subData.is_active,
    trial_ends_at: subData.trial_ends_at,
    created_at: subData.created_at
  };
  
  // Get plan details
  const plan = await fetchPlanByType(userSub.plan_type);
  
  return {
    subscription: userSub,
    plan,
    error: null
  };
};

// Fallback to direct database query if RPC fails
const handleDirectFallbackQuery = async (userId: string): Promise<{
  subscription: UserSubscription | null;
  plan: SubscriptionTier | null;
  error: string | null;
}> => {
  console.error('Falling back to direct query for subscription data');
  
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (fallbackError) {
    console.error('Error fetching subscription directly:', fallbackError);
    
    // Even if we have an error, let's attempt to get the starter plan as fallback
    const starterPlan = await fetchStarterPlan();
      
    if (starterPlan) {
      return {
        subscription: null,
        plan: starterPlan,
        error: 'Failed to load subscription information'
      };
    }
    
    return {
      subscription: null,
      plan: getDefaultPlan(),
      error: 'Failed to load subscription information'
    };
  }
  
  // Process the fallback data
  if (fallbackData) {
    const userSub: UserSubscription = {
      id: fallbackData.id,
      user_id: userId,
      plan_type: fallbackData.plan_type,
      is_active: fallbackData.is_active,
      trial_ends_at: fallbackData.trial_ends_at,
      created_at: fallbackData.created_at
    };
    
    // Get plan details
    const plan = await fetchPlanByType(userSub.plan_type);
    
    return {
      subscription: userSub,
      plan,
      error: null
    };
  } else {
    // No subscription found, create default one with starter plan
    const starterPlan = await fetchStarterPlan();
      
    if (starterPlan) {
      // Create virtual subscription with starter plan
      const userSub = createDefaultSubscription(userId);
      
      // Create a record in the database for this user with the starter plan
      try {
        await createDefaultUserSubscription(userId);
      } catch (err) {
        console.error('Error creating default subscription:', err);
      }
      
      return {
        subscription: userSub,
        plan: starterPlan,
        error: null
      };
    }
    
    return {
      subscription: createDefaultSubscription(userId),
      plan: getDefaultPlan(),
      error: null
    };
  }
};
