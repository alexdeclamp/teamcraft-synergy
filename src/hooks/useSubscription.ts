
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = () => {
  const subscriptionData = useSubscriptionData();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgradeToProPlan = async (priceId?: string) => {
    if (!user) {
      toast.error('You must be logged in to upgrade');
      return;
    }

    try {
      setIsUpgrading(true);
      toast.loading('Preparing checkout...', { id: 'stripe-checkout' });
      
      console.log('Initiating upgrade for user:', user.id);
      
      // Call our Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          userId: user.id,
          priceId: priceId // Pass the price ID if provided
        }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to create checkout session. Please try again.', { id: 'stripe-checkout' });
        return;
      }
      
      if (data?.url) {
        toast.success('Redirecting to secure checkout...', { id: 'stripe-checkout' });
        console.log('Redirecting to Stripe checkout');
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

  return {
    ...subscriptionData,
    upgradeToProPlan,
    isUpgrading
  };
};
