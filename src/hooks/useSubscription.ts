
import { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      // Use RPC function to get user subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_user_subscription', { user_id_param: user.id });

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to load subscription information');
        toast.error('Could not load subscription data');
        return;
      }

      if (subscriptionData) {
        const userSub: UserSubscription = {
          id: subscriptionData.id || 'default',
          user_id: user.id,
          plan_type: subscriptionData.plan_type as SubscriptionPlan,
          is_active: subscriptionData.is_active || true,
          trial_ends_at: subscriptionData.trial_ends_at,
          created_at: subscriptionData.created_at || new Date().toISOString()
        };
        
        setUserSubscription(userSub);
        
        // Get plan details
        const { data: planData, error: planError } = await supabase
          .rpc('get_subscription_tier', { plan_type_param: userSub.plan_type });
          
        if (planError) {
          console.error('Error fetching plan details:', planError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          return;
        }
        
        if (planData) {
          const planDetails: SubscriptionTier = {
            id: planData.id,
            name: planData.name,
            plan_type: planData.plan_type as SubscriptionPlan,
            price: planData.price,
            max_api_calls: planData.max_api_calls,
            max_brains: planData.max_brains,
            max_documents: planData.max_documents,
            features: planData.features || [],
            is_default: planData.is_default
          };
          
          setPlanDetails(planDetails);
        }
      } else {
        // No subscription found, create a default plan
        const { data: defaultPlanData, error: defaultPlanError } = await supabase
          .rpc('get_default_subscription_tier');
          
        if (defaultPlanError) {
          console.error('Error fetching default plan:', defaultPlanError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          return;
        }
        
        if (defaultPlanData) {
          // Create virtual subscription with default plan
          const defaultPlan: SubscriptionTier = {
            id: defaultPlanData.id,
            name: defaultPlanData.name,
            plan_type: defaultPlanData.plan_type as SubscriptionPlan,
            price: defaultPlanData.price,
            max_api_calls: defaultPlanData.max_api_calls,
            max_brains: defaultPlanData.max_brains,
            max_documents: defaultPlanData.max_documents,
            features: defaultPlanData.features || [],
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
          
          // Create a record in the database for this user with the default plan
          const { error: createSubError } = await supabase
            .rpc('create_user_subscription', { 
              user_id_param: user.id, 
              plan_type_param: defaultPlan.plan_type 
            });
            
          if (createSubError) {
            console.error('Error creating default subscription:', createSubError);
            // Don't set error or toast here as we already have the default plan
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
