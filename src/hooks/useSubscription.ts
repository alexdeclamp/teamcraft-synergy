
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getUserStats } from '@/components/navbar/UserStatsManager';

// Default Stripe price ID for the Pro plan
const DEFAULT_PRO_PRICE_ID = 'price_1R42nVDkiO3r5OEtK8vc77rS';

export const useSubscription = () => {
  const subscriptionData = useSubscriptionData();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);

  const upgradeToProPlan = async (priceId: string = DEFAULT_PRO_PRICE_ID) => {
    if (!user) {
      toast.error('You must be logged in to upgrade');
      return;
    }

    try {
      setIsUpgrading(true);
      toast.loading('Preparing checkout...', { id: 'stripe-checkout' });
      
      console.log('Initiating upgrade for user:', user.id, 'with price ID:', priceId);
      
      // Call our Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          userId: user.id,
          priceId: priceId // Pass the price ID
        }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to create checkout session. Please try again.', { id: 'stripe-checkout' });
        return;
      }
      
      if (data?.url) {
        toast.success('Redirecting to secure checkout...', { id: 'stripe-checkout' });
        console.log('Redirecting to Stripe checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        toast.error('Could not create checkout session. Please try again later.', { id: 'stripe-checkout' });
      }
    } catch (err) {
      console.error('Error upgrading to Pro:', err);
      toast.error('Failed to initiate upgrade process. Please try again.', { id: 'stripe-checkout' });
    } finally {
      setIsUpgrading(false);
    }
  };

  // New function to check if user is at or over limits
  const checkUserLimits = async (actionType: 'brain' | 'api_call' | 'document' = 'api_call') => {
    if (!subscriptionData.planDetails || subscriptionData.isLoading) {
      return { canProceed: false, message: 'Loading subscription information...' };
    }

    setIsCheckingLimits(true);
    try {
      // Get current usage stats
      const userStats = getUserStats();
      const plan = subscriptionData.planDetails;
      
      // If user is on Pro plan, they can always proceed
      if (plan.plan_type === 'pro') {
        return { canProceed: true };
      }
      
      // Check specific limits based on action type
      switch (actionType) {
        case 'brain':
          if (userStats.ownedBrains >= plan.max_brains) {
            return {
              canProceed: false,
              message: `You've reached the maximum limit of ${plan.max_brains} brains on your Starter plan. Please upgrade to Pro for unlimited brains.`
            };
          }
          break;
        
        case 'api_call':
          if (userStats.apiCalls >= plan.max_api_calls) {
            return {
              canProceed: false,
              message: `You've reached your monthly limit of ${plan.max_api_calls} AI API calls. Please upgrade to Pro for unlimited API usage.`
            };
          }
          break;
        
        case 'document':
          // For document uploads - unlikely to hit this limit on Starter plan as it's very high
          if (userStats.documents >= plan.max_documents) {
            return {
              canProceed: false, 
              message: `You've reached your limit of ${plan.max_documents} documents. Please upgrade to Pro for unlimited storage.`
            };
          }
          break;
      }
      
      // If we get here, user is within limits
      return { canProceed: true };
      
    } catch (error) {
      console.error('Error checking user limits:', error);
      // Fallback to allow the action on error, but log it
      return { canProceed: true };
    } finally {
      setIsCheckingLimits(false);
    }
  };

  return {
    ...subscriptionData,
    upgradeToProPlan,
    isUpgrading,
    checkUserLimits,
    isCheckingLimits
  };
};
