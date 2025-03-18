
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
      // Execute the setup-subscription-tables function if not done already
      const functionUrl = `${supabase.supabaseUrl}/functions/v1/setup-subscription-tables`;
      
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        console.log('Setup subscription tables result:', result);
      } catch (setupError) {
        console.error('Error setting up subscription tables:', setupError);
        // Continue anyway as tables might already be set up
      }
      
      // Check if user has a subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to load subscription information');
        toast.error('Could not load subscription data');
        setIsLoading(false);
        return;
      }

      let currentUserSubscription: UserSubscription;
      
      if (subscriptionData) {
        // User has a subscription
        currentUserSubscription = {
          id: subscriptionData.id,
          user_id: user.id,
          plan_type: subscriptionData.plan_type as SubscriptionPlan,
          is_active: subscriptionData.is_active,
          trial_ends_at: subscriptionData.trial_ends_at,
          created_at: subscriptionData.created_at
        };
        
        setUserSubscription(currentUserSubscription);
        
        // Get details for this plan
        const { data: planData, error: planError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('plan_type', currentUserSubscription.plan_type)
          .single();
          
        if (planError) {
          console.error('Error fetching plan details:', planError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          setIsLoading(false);
          return;
        }
        
        if (planData) {
          const currentPlanDetails: SubscriptionTier = {
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
          
          setPlanDetails(currentPlanDetails);
        }
      } else {
        // No subscription found, look for default plan
        const { data: defaultPlanData, error: defaultPlanError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('is_default', true)
          .single();
          
        if (defaultPlanError) {
          console.error('Error fetching default plan:', defaultPlanError);
          setError('Failed to load plan details');
          toast.error('Could not load subscription details');
          setIsLoading(false);
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
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_type: defaultPlan.plan_type,
              is_active: true
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
