
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from '@/types/subscription';
import DatabaseSetup from '@/components/admin/DatabaseSetup';

const SubscriptionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    plan_type: SubscriptionPlan;
    is_active: boolean;
    trial_ends_at: string | null;
  } | null>(null);
  
  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Get the user's subscription
        const { data: subsData, error: subsError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        if (subsError && subsError.code !== 'PGRST116') { // PGRST116 is not found
          console.error('Error fetching subscription:', subsError);
        }
        
        setSubscription(subsData);
      } catch (error) {
        console.error('Error in subscription dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndSubscription();
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Subscription Dashboard</h2>
      
      {/* Database setup check - only visible to admin users */}
      <DatabaseSetup />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            {subscription?.plan_type === 'pro' && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Sparkles className="h-3 w-3 mr-1" /> Pro
              </Badge>
            )}
            {subscription?.plan_type === 'free' && (
              <Badge variant="outline">Free</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {loading ? (
                <p>Loading subscription details...</p>
              ) : subscription ? (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {subscription.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                  
                  {subscription.trial_ends_at && (
                    <p className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                  
                  {/* Upgrade/Downgrade button placeholder */}
                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="w-full">
                      {subscription.plan_type === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                    No active subscription found
                  </p>
                  <Button size="sm" variant="default" className="w-full mt-2">
                    Start Free Plan
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
