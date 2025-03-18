
import { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

type SubscriptionData = {
  userSubscription: UserSubscription | null;
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useSubscription = (): SubscriptionData => {
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
      // Call the Edge Function to ensure subscription tables exist
      try {
        const response = await fetch('/api/setup-subscription-tables', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Edge function response not OK:', await response.text());
        }
      } catch (setupError) {
        console.error('Error calling subscription setup function:', setupError);
        // Continue anyway as tables might already be set up
      }
      
      // Use the RPC function to get the user's subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { p_user_id: user.id });

      if (subscriptionError) {
        console.error('Error fetching subscription with RPC:', subscriptionError);
        
        // Fall back to direct SQL query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (fallbackError) {
          console.error('Error fetching subscription directly:', fallbackError);
          setError('Failed to load subscription information');
          toast.error('Could not load subscription data');
          setIsLoading(false);
          return;
        }
        
        // If we have fallback data, use it
        if (fallbackData) {
          const userSub: UserSubscription = {
            id: fallbackData.id,
            user_id: user.id,
            plan_type: fallbackData.plan_type as SubscriptionPlan,
            is_active: fallbackData.is_active,
            trial_ends_at: fallbackData.trial_ends_at,
            created_at: fallbackData.created_at
          };
          
          setUserSubscription(userSub);
          
          // Get plan details
          const { data: planData, error: planError } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('plan_type', userSub.plan_type)
            .maybeSingle();
            
          if (planError) {
            console.error('Error fetching plan details:', planError);
            setError('Failed to load plan details');
            toast.error('Could not load subscription details');
            setIsLoading(false);
            return;
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
            
            setPlanDetails(plan);
          }
        } else {
          // No subscription found, look for default plan (should be starter)
          const { data: defaultPlanData, error: defaultPlanError } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('plan_type', 'starter')
            .maybeSingle();
            
          if (defaultPlanError) {
            console.error('Error fetching default plan:', defaultPlanError);
            setError('Failed to load plan details');
            toast.error('Could not load subscription details');
            setIsLoading(false);
            return;
          }
          
          if (defaultPlanData) {
            // Create virtual subscription with starter plan
            const defaultPlan: SubscriptionTier = {
              id: defaultPlanData.id,
              name: defaultPlanData.name,
              plan_type: defaultPlanData.plan_type as SubscriptionPlan,
              price: defaultPlanData.price,
              max_api_calls: defaultPlanData.max_api_calls,
              max_brains: defaultPlanData.max_brains,
              max_documents: defaultPlanData.max_documents,
              features: convertJsonToStringArray(defaultPlanData.features),
              is_default: true
            };
            
            const userSub: UserSubscription = {
              id: 'default',
              user_id: user.id,
              plan_type: defaultPlan.plan_type,
              is_active: true,
              trial_ends_at: null,
              created_at: new Date().toISOString()
            };
            
            setUserSubscription(userSub);
            setPlanDetails(defaultPlan);
            
            // Create a record in the database for this user with the starter plan
            try {
              const { error: createSubError } = await supabase.rpc('create_user_subscription', {
                p_user_id: user.id,
                p_plan_type: 'starter'
              });
                
              if (createSubError) {
                console.error('Error creating default subscription with RPC:', createSubError);
                
                // Fall back to direct insert
                const { error: insertError } = await supabase
                  .from('user_subscriptions')
                  .insert({
                    user_id: user.id,
                    plan_type: 'starter',
                    is_active: true
                  });
                  
                if (insertError) {
                  console.error('Error creating default subscription:', insertError);
                }
              }
            } catch (err) {
              console.error('Error in subscription creation:', err);
              // We already have the default plan in our state, so continue
            }
          }
        }
      } else if (subscriptionData) {
        // The RPC function is expected to return an array with one item
        // We need to handle both cases: when it returns an array and when it's already the item
        const subData = Array.isArray(subscriptionData) ? subscriptionData[0] : subscriptionData;
        
        if (!subData) {
          console.log('No subscription data found, will create one');
          // Handle the case where user has no subscription yet - find starter plan
          const { data: starterPlan } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('plan_type', 'starter')
            .maybeSingle();
            
          if (starterPlan) {
            // Create starter subscription automatically
            await supabase.rpc('create_user_subscription', {
              p_user_id: user.id,
              p_plan_type: 'starter'
            });
            
            // Restart the fetch process
            fetchSubscriptionData();
            return;
          }
        } else {
          // We have subscription data
          const userSub: UserSubscription = {
            id: subData.id,
            user_id: user.id,
            plan_type: subData.plan_type as SubscriptionPlan,
            is_active: subData.is_active,
            trial_ends_at: subData.trial_ends_at,
            created_at: subData.created_at
          };
          
          setUserSubscription(userSub);
          
          // Get plan details
          const { data: planData, error: planError } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('plan_type', userSub.plan_type)
            .maybeSingle();
            
          if (planError) {
            console.error('Error fetching plan details:', planError);
            setError('Failed to load plan details');
            toast.error('Could not load subscription details');
            setIsLoading(false);
            return;
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
            
            setPlanDetails(plan);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely convert Json[] to string[]
  const convertJsonToStringArray = (jsonValue: Json | null): string[] => {
    if (!jsonValue) return [];
    
    if (Array.isArray(jsonValue)) {
      // Convert each item to string to ensure type safety
      return jsonValue.map(item => String(item));
    }
    
    return [];
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
