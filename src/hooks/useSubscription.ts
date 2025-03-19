
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscription = () => {
  const subscriptionData = useSubscriptionData();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgradeToProPlan = async () => {
    if (!user) {
      toast.error('You must be logged in to upgrade');
      return;
    }

    try {
      setIsUpgrading(true);
      toast.info('Preparing checkout...');
      
      // Use the direct Stripe checkout URL instead of generating one
      const paymentUrl = "https://buy.stripe.com/test_14k7sLg803UpbuwdQQ";
      
      console.log('Redirecting to Stripe checkout:', paymentUrl);
      
      // Redirect to the Stripe checkout page
      window.location.href = paymentUrl;
      
    } catch (err) {
      console.error('Error upgrading to Pro:', err);
      toast.error('Failed to initiate upgrade process. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    ...subscriptionData,
    upgradeToProPlan,
    isUpgrading
  };
};
