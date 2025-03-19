
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
      
      // Call the Supabase Edge Function to create a payment link
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { userId: user.id }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create payment link');
      }
      
      if (!data?.paymentUrl) {
        throw new Error('No payment URL returned');
      }
      
      // Redirect to the Stripe checkout page
      window.location.href = data.paymentUrl;
      
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
