
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MembershipCard from '@/components/membership/MembershipCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Info, AlertTriangle } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  payment_link?: string;
};

// Stripe payment links
const PAYMENT_LINKS = {
  // Production links
  pro_prod: "https://buy.stripe.com/cN29CZgrl7aHebu4gg",
  team_prod: "https://buy.stripe.com/fZe2ax8YT9iP4AU9AB",
  
  // Test links
  pro_test: "https://buy.stripe.com/test_14k7sLg803UpbuwdQQ"
};

// Use test mode flag - set to true for testing, false for production
const USE_TEST_MODE = true;

const Membership = () => {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [currentTierId, setCurrentTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);

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
        
        // Get user's current membership tier directly from auth context
        console.log("Current membership tier from profile:", profile?.membership_tier_id);
        
        // Transform the data to ensure features is properly typed and add payment links
        const formattedTiers: MembershipTier[] = tiers.map(tier => {
          const formattedTier: MembershipTier = {
            ...tier,
            features: parseFeatures(tier.features)
          };
          
          // Add payment links based on tier name and test mode flag
          if (tier.name.toLowerCase().includes('pro')) {
            formattedTier.payment_link = USE_TEST_MODE ? PAYMENT_LINKS.pro_test : PAYMENT_LINKS.pro_prod;
          } else if (tier.name.toLowerCase().includes('team')) {
            formattedTier.payment_link = USE_TEST_MODE ? PAYMENT_LINKS.pro_test : PAYMENT_LINKS.team_prod;
          }
          
          return formattedTier;
        });
        
        setMembershipTiers(formattedTiers);
        setCurrentTierId(profile?.membership_tier_id || null);
      } catch (error) {
        console.error('Error fetching membership data:', error);
        toast.error('Failed to load membership information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembershipData();
  }, [user, navigate, profile, refreshing]);
  
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
  
  const handleSelectTier = (tierId: string) => {
    toast.info('Please use the Subscribe button to access our Stripe checkout page');
    console.log('Selected tier:', tierId);
  };
  
  const refreshMembership = async () => {
    setRefreshing(true);
    await fetchProfile();
    toast.success('Membership status refreshed');
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };
  
  // Handle subscription completion redirect from Stripe with automatic refresh
  useEffect(() => {
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');
      
      if (success === 'true') {
        toast.success('Payment successful! Your membership is being updated.');
        
        // Set up automatic refresh attempts
        const startAutoRefresh = async () => {
          // Immediately refresh once
          await fetchProfile();
          
          // Set up periodic refresh to check for updates (3 attempts, 3 seconds apart)
          const maxAttempts = 3;
          let currentAttempt = 0;
          
          const refreshInterval = setInterval(async () => {
            currentAttempt++;
            console.log(`Auto-refreshing membership status (attempt ${currentAttempt}/${maxAttempts})...`);
            
            await fetchProfile();
            setAutoRefreshCount(prev => prev + 1);
            
            if (currentAttempt >= maxAttempts) {
              clearInterval(refreshInterval);
              console.log('Automatic refresh complete.');
            }
          }, 3000);
          
          // Clean up the interval if component unmounts
          return () => clearInterval(refreshInterval);
        };
        
        startAutoRefresh();
        
        // Clean up the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else if (canceled === 'true') {
        toast.error('Payment was canceled');
        // Clean up the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };
    
    checkUrlParams();
  }, []);
  
  // When autoRefreshCount changes, update the currentTierId
  useEffect(() => {
    if (autoRefreshCount > 0) {
      setCurrentTierId(profile?.membership_tier_id || null);
    }
  }, [autoRefreshCount, profile]);

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
          <h1 className="text-3xl font-bold">Membership Plans {USE_TEST_MODE ? '(Test Mode)' : ''}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you and upgrade your Bra3n experience.
          </p>
        </div>
        
        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            {USE_TEST_MODE 
              ? 'This is running in TEST MODE. Use Stripe test cards for payments (e.g. 4242 4242 4242 4242).' 
              : 'After completing payment, your account will be automatically upgraded. If you don\'t see changes immediately, please refresh the page.'}
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button 
            variant="default" 
            onClick={refreshMembership}
            disabled={refreshing}
            className="mb-4"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>Refresh Membership Status</>
            )}
          </Button>
        </div>
        
        {autoRefreshCount > 0 && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <Info className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Your membership status is being automatically refreshed after payment.
              {autoRefreshCount === 3 && " If you still don't see your membership updated, please try refreshing the page."}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Having trouble with payments? Your membership should update automatically after checkout.
            Current tier ID: {profile?.membership_tier_id || "None"}
          </AlertDescription>
        </Alert>
        
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
              paymentLink={tier.payment_link}
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

