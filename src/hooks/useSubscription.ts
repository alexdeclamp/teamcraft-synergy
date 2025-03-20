
import { useSubscriptionData } from './subscription/useSubscriptionData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
      toast.info('Redirecting to checkout...');
      
      // Direct payment link instead of generating one through an edge function
      const basePaymentUrl = 'https://buy.stripe.com/test_14k7sLg803UpbuwdQQ';
      
      // Append the client_reference_id directly to the URL as a query parameter for Stripe to include in webhooks
      const paymentUrl = `${basePaymentUrl}?client_reference_id=${user.id}`;
      
      console.log('Redirecting to Stripe checkout:', paymentUrl, 'User ID:', user.id);
      
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
