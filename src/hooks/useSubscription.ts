
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
      // Get user's subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116 is "No rows returned" - not an error in our case
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to load subscription information');
        toast.error('Could not load subscription data');
        return;
      }

      let userSub: UserSubscription | null = null;
      
      // If user has a subscription, use it; otherwise check for default plan
      if (subscriptionData) {
        userSub = subscriptionData as UserSubscription;
        setUserSubscription(userSub);
        
        // Get plan details
        const { data: planData, error: planError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('plan_type', userSub.plan_type)
          .single();
          
        if (planError) {
          console.error('Error fetching plan details:', planError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          return;
        }
        
        setPlanDetails(planData as SubscriptionTier);
      } else {
        // No subscription found, use default plan (starter)
        const { data: defaultPlanData, error: defaultPlanError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('is_default', true)
          .single();
          
        if (defaultPlanError) {
          console.error('Error fetching default plan:', defaultPlanError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          return;
        }
        
        // Create virtual subscription with default plan
        const defaultPlan = defaultPlanData as SubscriptionTier;
        
        userSub = {
          id: 'default',
          user_id: user.id,
          plan_type: defaultPlan.plan_type,
          is_active: true,
          trial_ends_at: null,
          created_at: new Date().toISOString()
        };
        
        setUserSubscription(userSub);
        setPlanDetails(defaultPlan);
        
        // Optionally create a record in the database for this user with the default plan
        const { error: createSubError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_type: defaultPlan.plan_type,
            is_active: true,
          });
          
        if (createSubError) {
          console.error('Error creating default subscription:', createSubError);
          // Don't set error or toast here as we already have the default plan
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
