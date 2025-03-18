
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, Zap, CreditCard } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import ProfileStats from './ProfileStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';

export type UserStats = {
  apiCalls: number;
  ownedBrains: number;
  sharedBrains: number;
  documents: number;
};

let globalUserStats: UserStats = {
  apiCalls: 0,
  ownedBrains: 0,
  sharedBrains: 0,
  documents: 0
};

export const getUserStats = (): UserStats => {
  return globalUserStats;
};

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
};

const ProfileDialog = ({ open, onOpenChange, onOpenSettings }: ProfileDialogProps) => {
  const { user, profile, signOut } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [apiCalls, setApiCalls] = useState(0);
  const [ownedBrainCount, setOwnedBrainCount] = useState(0);
  const [sharedBrainCount, setSharedBrainCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { planDetails, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription();

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user || !open) return;
      
      setStatsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching user statistics...');
        
        const { data, error: functionError } = await supabase.functions.invoke('user-statistics', {
          body: { 
            userId: user.id
          },
        });
        
        if (functionError) {
          console.error('Error invoking user-statistics function:', functionError);
          setError('Failed to fetch statistics');
          toast.error('Could not load usage statistics');
          return;
        }
        
        console.log('User statistics response:', data);
        
        if (!data) {
          setError('No data returned from server');
          return;
        }
        
        if (data.status === 'error') {
          setError(data.error || 'An error occurred');
          return;
        }
        
        const apiCallsCount = data.apiCalls ?? 0;
        const ownedBrains = data.ownedBrains ?? 0;
        const sharedBrains = data.sharedBrains ?? 0;
        const docs = data.documents ?? 0;
        
        setApiCalls(apiCallsCount);
        setOwnedBrainCount(ownedBrains);
        setSharedBrainCount(sharedBrains);
        setDocumentCount(docs);
        
        globalUserStats = {
          apiCalls: apiCallsCount,
          ownedBrains: ownedBrains,
          sharedBrains: sharedBrains,
          documents: docs
        };
        
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('An unexpected error occurred');
        toast.error('Failed to load user statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user, open]);

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Your account information
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-medium">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            
            {!subscriptionLoading && planDetails && (
              <Badge 
                variant={planDetails.plan_type === 'pro' ? "default" : "secondary"}
                className={`${planDetails.plan_type === 'pro' ? 'bg-primary' : ''} mt-2`}
              >
                <Zap className="h-3 w-3 mr-1" />
                {planDetails.name} Plan
              </Badge>
            )}
            
            <div className="w-full space-y-2 mt-4">
              <div className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">Account Type</span>
                <span className="text-sm">
                  {subscriptionLoading 
                    ? 'Loading...' 
                    : subscriptionError 
                      ? 'Error loading plan' 
                      : planDetails?.name || 'Starter'}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 gap-2" 
              onClick={() => setSubscriptionDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
              Manage Subscription
            </Button>
            
            <ProfileStats 
              isLoading={statsLoading}
              error={error}
              apiCalls={apiCalls}
              ownedBrains={ownedBrainCount}
              sharedBrains={sharedBrainCount}
              documents={documentCount}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" className="gap-1 text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={onOpenSettings}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <SubscriptionDialog 
        open={subscriptionDialogOpen} 
        onOpenChange={setSubscriptionDialogOpen}
        userBrainCount={ownedBrainCount + sharedBrainCount}
        apiCallsUsed={apiCalls}
      />
    </>
  );
};

export default ProfileDialog;
