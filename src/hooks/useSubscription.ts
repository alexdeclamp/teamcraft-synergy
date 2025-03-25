
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Production Stripe price ID for the Pro plan
const DEFAULT_PRO_PRICE_ID = 'price_1R6ZG0DkiO3r5OEtxXnJaSP3';

// Direct Stripe payment link
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/3cs4iF0sn2Urffy003';

export const useSubscription = () => {
  const subscriptionData = useSubscriptionData();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgradeToProPlan = async (priceId: string = DEFAULT_PRO_PRICE_ID) => {
    if (!user) {
      toast.error('You must be logged in to upgrade');
      return;
    }

    try {
      setIsUpgrading(true);
      toast.loading('Preparing checkout...', { id: 'stripe-checkout' });
      
      console.log('Initiating upgrade for user:', user.id);
      
      // Using direct payment link instead of creating a checkout session
      toast.success('Redirecting to secure checkout...', { id: 'stripe-checkout' });
      window.location.href = STRIPE_PAYMENT_LINK;
      
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
