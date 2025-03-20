
import { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserSubscriptionAndPlan } from './services/subscriptionService';
import { getDefaultPlan } from './utils/planUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching subscription data for user:', user.id);
      // Get the subscription data using the service function
      const { subscription, plan, error: fetchError } = await fetchUserSubscriptionAndPlan(user.id);
      
      if (fetchError) {
        console.error('Error from subscription service:', fetchError);
        setError(fetchError);
        // Set default fallback plan
        setPlanDetails(getDefaultPlan());
      } else {
        console.log('Successfully fetched subscription data:', subscription?.plan_type);
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
  }, [user]);

  // Function to manually register subscription after checkout
  const registerStripeSubscription = useCallback(async (sessionId: string) => {
    if (!user) {
      console.error('Cannot register subscription without a logged in user');
      return false;
    }
    
    try {
      toast.loading('Finalizing your subscription...', { id: 'subscription-update' });
      
      console.log(`Registering subscription for session ${sessionId} and user ${user.id}`);
      
      const { data, error } = await supabase.functions.invoke('process-stripe-webhook', {
        body: { 
          userId: user.id,
          sessionId
        }
      });
      
      if (error) {
        console.error('Error invoking webhook function:', error);
        toast.error('Failed to finalize subscription. Please contact support.', { 
          id: 'subscription-update' 
        });
        return false;
      }
      
      if (data?.success) {
        console.log('Subscription registered successfully');
        toast.success('Your subscription has been upgraded to Pro!', { 
          id: 'subscription-update',
          duration: 5000
        });
        
        // Refresh subscription data
        await fetchSubscriptionData();
        return true;
      } else {
        console.error('Failed to register subscription:', data?.error);
        toast.error(`Failed to update subscription: ${data?.error || 'Unknown error'}`, { 
          id: 'subscription-update' 
        });
        return false;
      }
    } catch (err) {
      console.error('Unexpected error registering subscription:', err);
      toast.error('An unexpected error occurred while finalizing your subscription.', { 
        id: 'subscription-update' 
      });
      return false;
    }
  }, [user, fetchSubscriptionData]);

  // Initial data fetch
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Listen for URL parameter changes to refetch after payment completion
  useEffect(() => {
    const handleSubscriptionUpdate = async () => {
      const params = new URLSearchParams(window.location.search);
      const subscriptionStatus = params.get('subscription');
      const sessionId = params.get('session_id');
      
      if (subscriptionStatus === 'success' && sessionId) {
        console.log('Detected successful payment, registering subscription...');
        
        // Register the subscription and then clear URL parameters
        const success = await registerStripeSubscription(sessionId);
        
        // Clear URL parameters after processing
        const url = new URL(window.location.href);
        url.searchParams.delete('subscription');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
        
        if (!success) {
          console.error('Could not verify subscription');
        }
      } else if (subscriptionStatus === 'success') {
        // Legacy handling without session_id
        console.log('Detected successful payment (legacy mode)');
        toast.loading('Updating your subscription status...', { id: 'subscription-update' });
        
        // Just refetch and hope the webhook worked
        await fetchSubscriptionData();
        if (userSubscription?.plan_type === 'pro') {
          toast.success('Your subscription has been upgraded to Pro!', { 
            id: 'subscription-update',
            duration: 5000
          });
        } else {
          toast.info('Your payment was successful! Your subscription will be updated shortly.', { 
            id: 'subscription-update',
            duration: 5000
          });
        }
        
        // Clear URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('subscription');
        window.history.replaceState({}, '', url.toString());
      } else if (subscriptionStatus === 'canceled') {
        toast.info('Subscription upgrade was canceled.', { duration: 4000 });
        
        // Clear the URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('subscription');
        window.history.replaceState({}, '', url.toString());
      }
    };
    
    handleSubscriptionUpdate();
  }, [fetchSubscriptionData, registerStripeSubscription, userSubscription?.plan_type]);

  return {
    userSubscription,
    planDetails,
    isLoading,
    error,
    refetch: fetchSubscriptionData,
  };
};
