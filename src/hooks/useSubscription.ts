
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
      
      // Generate a dynamic payment URL that includes the user ID
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error creating payment link:', error);
        toast.error(`Failed to create payment link: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (!data?.paymentUrl) {
        console.error('No payment URL returned from API:', data);
        toast.error('Failed to generate checkout. Please try again.');
        return;
      }
      
      console.log('Redirecting to Stripe checkout:', data.paymentUrl);
      
      // Redirect to the Stripe checkout page
      window.location.href = data.paymentUrl;
      
    } catch (err) {
      console.error('Error upgrading to Pro:', err);
      toast.error(`Failed to initiate upgrade process: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
