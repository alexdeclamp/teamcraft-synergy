
import { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserSubscriptionAndPlan } from './services/subscriptionService';
import { getDefaultPlan } from './utils/planUtils';
import { toast } from 'sonner';

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

  // Initial data fetch
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Listen for URL parameter changes to refetch after payment completion
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      const params = new URLSearchParams(window.location.search);
      const subscriptionStatus = params.get('subscription');
      
      if (subscriptionStatus === 'success') {
        console.log('Detected successful payment, refetching subscription data...');
        // Add a small delay to allow the webhook to process
        setTimeout(() => {
          fetchSubscriptionData().then(() => {
            console.log('Subscription data refreshed after payment');
          });
        }, 2000);
      }
    };
    
    handleSubscriptionUpdate();
  }, [fetchSubscriptionData]);

  return {
    userSubscription,
    planDetails,
    isLoading,
    error,
    refetch: fetchSubscriptionData,
  };
};
