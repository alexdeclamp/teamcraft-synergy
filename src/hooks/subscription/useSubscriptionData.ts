
import { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { convertJsonToStringArray } from '@/types/subscription.utils';

type SubscriptionData = {
  userSubscription: UserSubscription | null;
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useSubscriptionData = (): SubscriptionData => {
  const { user } = useAuth();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [planDetails, setPlanDetails] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // We'll get the subscription data using the helper functions
      const { subscription, plan, error: fetchError } = await fetchUserSubscriptionAndPlan(user.id);
      
      if (fetchError) {
        setError(fetchError);
        // Set default fallback plan
        setPlanDetails(getDefaultPlan());
      } else {
        setUserSubscription(subscription);
        setPlanDetails(plan);
      }
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      setError('An unexpected error occurred');
      
      // Set default subscription info as fallback
      setPlanDetails(getDefaultPlan());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  return {
    userSubscription,
    planDetails,
    isLoading,
    error,
    refetch: fetchSubscriptionData,
  };
};

// Helper function to get default plan as fallback
const getDefaultPlan = (): SubscriptionTier => ({
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

// Helper function to fetch user subscription and plan details
export const fetchUserSubscriptionAndPlan = async (userId: string): Promise<{
  subscription: UserSubscription | null;
  plan: SubscriptionTier | null;
  error: string | null;
}> => {
  try {
    // Try to set up subscription tables first
    try {
      await setupSubscriptionTables();
    } catch (setupError) {
      console.error('Error calling subscription setup function:', setupError);
      // Continue anyway as tables might already be set up
    }
    
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
    const { data: starterPlan } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', 'starter')
      .eq('is_default', true)
      .maybeSingle();
      
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
    plan_type: subData.plan_type as SubscriptionPlan,
    is_active: subData.is_active,
    trial_ends_at: subData.trial_ends_at,
    created_at: subData.created_at
  };
  
  // Get plan details
  const { data: planData, error: planError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('plan_type', userSub.plan_type)
    .maybeSingle();
    
  if (planError) {
    console.error('Error fetching plan details:', planError);
    return {
      subscription: userSub,
      plan: getDefaultPlan(),
      error: 'Failed to load plan details'
    };
  }
  
  if (planData) {
    const plan: SubscriptionTier = {
      id: planData.id,
      name: planData.name,
      plan_type: planData.plan_type as SubscriptionPlan,
      price: planData.price,
      max_api_calls: planData.max_api_calls,
      max_brains: planData.max_brains,
      max_documents: planData.max_documents,
      features: convertJsonToStringArray(planData.features),
      is_default: planData.is_default
    };
    
    return {
      subscription: userSub,
      plan: plan,
      error: null
    };
  }
  
  return {
    subscription: userSub,
    plan: getDefaultPlan(),
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
    const { data: fallbackPlanData } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', 'starter')
      .eq('is_default', true)
      .maybeSingle();
      
    if (fallbackPlanData) {
      const defaultPlan = createPlanFromData(fallbackPlanData);
      return {
        subscription: null,
        plan: defaultPlan,
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
      plan_type: fallbackData.plan_type as SubscriptionPlan,
      is_active: fallbackData.is_active,
      trial_ends_at: fallbackData.trial_ends_at,
      created_at: fallbackData.created_at
    };
    
    // Get plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', userSub.plan_type)
      .maybeSingle();
      
    if (planError) {
      console.error('Error fetching plan details:', planError);
      return {
        subscription: userSub,
        plan: getDefaultPlan(),
        error: 'Failed to load plan details'
      };
    }
    
    if (planData) {
      const plan = createPlanFromData(planData);
      return {
        subscription: userSub,
        plan,
        error: null
      };
    }
    
    return {
      subscription: userSub,
      plan: getDefaultPlan(),
      error: null
    };
  } else {
    // No subscription found, look for default plan (should be starter)
    const { data: defaultPlanData } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('plan_type', 'starter')
      .maybeSingle();
      
    if (defaultPlanData) {
      // Create virtual subscription with starter plan
      const defaultPlan = createPlanFromData(defaultPlanData);
      const userSub = createDefaultSubscription(userId);
      
      // Create a record in the database for this user with the starter plan
      try {
        await createDefaultUserSubscription(userId);
      } catch (err) {
        console.error('Error creating default subscription:', err);
      }
      
      return {
        subscription: userSub,
        plan: defaultPlan,
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

// Helper to create a subscription object with default values
const createDefaultSubscription = (userId: string): UserSubscription => ({
  id: 'default',
  user_id: userId,
  plan_type: 'starter',
  is_active: true,
  trial_ends_at: null,
  created_at: new Date().toISOString()
});

// Helper to create a plan object from database data
const createPlanFromData = (planData: any): SubscriptionTier => ({
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

// Helper to create a default user subscription in the database
const createDefaultUserSubscription = async (userId: string): Promise<void> => {
  const { error: createSubError } = await supabase.rpc('create_user_subscription', {
    p_user_id: userId,
    p_plan_type: 'starter'
  });
    
  if (createSubError) {
    console.error('Error creating default subscription with RPC:', createSubError);
    
    // Fall back to direct insert
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'starter',
        is_active: true
      });
      
    if (insertError) {
      console.error('Error creating default subscription:', insertError);
      throw insertError;
    }
  }
};

// Import setupSubscriptionTables function
import { setupSubscriptionTables } from '@/pages/api/setup-subscription-tables';
