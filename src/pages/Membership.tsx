
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MembershipCard from '@/components/membership/MembershipCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

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
  const [loading, setLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [currentTierId, setCurrentTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
  
  const handleSelectTier = (tierId: string) => {
    toast.info('Stripe integration coming soon!');
    // For now, just show a notification that this will be implemented in the future
    console.log('Selected tier:', tierId);
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
