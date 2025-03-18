
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MembershipCard from '@/components/membership/MembershipCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

type MembershipTier = {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: {
    name: string;
    description: string;
  }[];
};

const Membership = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [currentTierId, setCurrentTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'canceled' | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // Check for checkout status in URL
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setCheckoutStatus('success');
      toast.success('Subscription activated successfully!');
    } else if (checkout === 'canceled') {
      setCheckoutStatus('canceled');
      toast.error('Checkout was canceled.');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      setLoading(true);
      
      try {
        // Get all membership tiers
        const { data: tiers, error: tiersError } = await supabase
          .from('membership_tiers')
          .select('*')
          .order('monthly_price', { ascending: true });
          
        if (tiersError) {
          throw tiersError;
        }
        
        // Get user's current membership tier
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('membership_tier_id')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          throw userError;
        }
        
        // Transform the data to ensure features is properly typed
        const formattedTiers = tiers.map(tier => ({
          ...tier,
          features: parseFeatures(tier.features)
        }));
        
        setMembershipTiers(formattedTiers);
        setCurrentTierId(userData?.membership_tier_id || null);
      } catch (error) {
        console.error('Error fetching membership data:', error);
        toast.error('Failed to load membership information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembershipData();
  }, [user, navigate]);
  
  // Helper function to parse the features from JSON
  const parseFeatures = (features: Json): { name: string; description: string }[] => {
    if (!features) return [];
    
    try {
      if (typeof features === 'string') {
        return JSON.parse(features);
      } else if (Array.isArray(features)) {
        return features as { name: string; description: string }[];
      } else {
        return Object.values(features);
      }
    } catch (e) {
      console.error('Error parsing features:', e);
      return [];
    }
  };
  
  const handleSelectTier = async (tierId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Don't allow selecting the same tier
    if (tierId === currentTierId) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    setCheckoutLoading(true);
    
    try {
      // Call our edge function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tierId: tierId,
          billingCycle: billingCycle,
        },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you and upgrade your Bra3n experience.
          </p>
        </div>
        
        {checkoutStatus && (
          <div className="mb-6">
            {checkoutStatus === 'success' ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Payment successful!</AlertTitle>
                <AlertDescription>
                  Your subscription has been activated. Enjoy your new membership benefits!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 border-amber-200">
                <XCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Checkout canceled</AlertTitle>
                <AlertDescription>
                  Your checkout process was canceled. You can try again whenever you're ready.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="flex justify-center pb-8">
          <Tabs
            defaultValue="monthly"
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipTiers.map((tier) => (
            <MembershipCard
              key={tier.id}
              name={tier.name}
              description={tier.description || ''}
              monthlyPrice={tier.monthly_price}
              yearlyPrice={tier.yearly_price}
              features={tier.features}
              isCurrentPlan={tier.id === currentTierId}
              onSelect={() => handleSelectTier(tier.id)}
              isLoading={checkoutLoading}
              billingCycle={billingCycle}
            />
          ))}
        </div>
        
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Need something more custom? Contact us for enterprise pricing.
          </p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Membership;
