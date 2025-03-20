
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
        // Show loading toast
        toast.loading('Updating your subscription status...', { id: 'subscription-update' });
        
        // Add multiple refetch attempts with increasing delays
        const attemptRefetch = (attempt = 1, maxAttempts = 10) => {
          console.log(`Subscription data refresh attempt ${attempt}/${maxAttempts}`);
          
          fetchSubscriptionData().then(() => {
            // Check if the plan was actually updated to pro
            if (userSubscription?.plan_type === 'pro') {
              toast.success('Your subscription has been upgraded to Pro!', { 
                id: 'subscription-update',
                duration: 5000
              });
              
              // Clear URL parameters after successful update
              const url = new URL(window.location.href);
              url.searchParams.delete('subscription');
              window.history.replaceState({}, '', url.toString());
            } else if (attempt < maxAttempts) {
              // If not pro yet, try again with increasing delay
              const delay = Math.min(attempt * 1500, 8000); // Increasing delay with a max of 8 seconds
              console.log(`Plan not updated yet (still ${userSubscription?.plan_type}), retrying in ${delay}ms`);
              setTimeout(() => attemptRefetch(attempt + 1), delay);
            } else {
              // After all attempts, show a message that we're still processing
              toast.info('Your payment was successful! Your subscription will be updated shortly.', { 
                id: 'subscription-update',
                duration: 8000
              });
              
              // Clear URL parameters after processing
              const url = new URL(window.location.href);
              url.searchParams.delete('subscription');
              window.history.replaceState({}, '', url.toString());
            }
          }).catch((err) => {
            console.error('Error during subscription refresh:', err);
            if (attempt < maxAttempts) {
              const delay = Math.min(attempt * 1500, 8000);
              setTimeout(() => attemptRefetch(attempt + 1), delay);
            } else {
              toast.error('There was a problem updating your subscription. It may take a few minutes to process.', { 
                id: 'subscription-update',
                duration: 5000
              });
              
              // Clear URL parameters after processing
              const url = new URL(window.location.href);
              url.searchParams.delete('subscription');
              window.history.replaceState({}, '', url.toString());
            }
          });
        };
        
        // Start the first attempt immediately, then try with longer intervals
        attemptRefetch();
      } else if (subscriptionStatus === 'canceled') {
        toast.info('Subscription upgrade was canceled.', { duration: 4000 });
        
        // Clear the URL parameters after processing
        const url = new URL(window.location.href);
        url.searchParams.delete('subscription');
        window.history.replaceState({}, '', url.toString());
      }
    };
    
    handleSubscriptionUpdate();
  }, [fetchSubscriptionData, userSubscription?.plan_type]);

  return {
    userSubscription,
    planDetails,
    isLoading,
    error,
    refetch: fetchSubscriptionData,
  };
};
