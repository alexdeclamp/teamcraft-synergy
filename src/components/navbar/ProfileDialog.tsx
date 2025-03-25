
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import UserAvatar from './UserAvatar';
import UserProfileInfo from './UserProfileInfo';
import UserStatsManager, { getUserStats } from './UserStatsManager';
import ProfileFooter from './ProfileFooter';

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
};

const ProfileDialog = ({ open, onOpenChange, onOpenSettings }: ProfileDialogProps) => {
  const { user, profile, signOut } = useAuth();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { planDetails, isLoading: subscriptionLoading } = useSubscription();
  const { apiCalls, ownedBrains, sharedBrains } = getUserStats();

  const handleSignOut = async () => {
    try {
      // Close the dialog first to improve perceived performance
      onOpenChange(false);
      // Then sign out
      await signOut();
    } catch (error) {
      console.error('Error in ProfileDialog signOut:', error);
    }
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
            <UserAvatar 
              fullName={profile?.full_name}
              email={user?.email}
              size="lg"
              className="mb-4"
            />
            
            <UserProfileInfo
              fullName={profile?.full_name}
              email={user?.email}
              createdAt={user?.created_at}
              planDetails={planDetails}
              isLoading={subscriptionLoading}
            />
            
            <Button 
              variant="outline" 
              className="w-full mt-4 gap-2" 
              onClick={() => setSubscriptionDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
              Manage Subscription
            </Button>
            
            <UserStatsManager userId={user?.id} isOpen={open} />
          </div>
          
          <ProfileFooter 
            onSignOut={handleSignOut}
            onOpenSettings={onOpenSettings}
          />
        </DialogContent>
      </Dialog>
      
      <SubscriptionDialog 
        open={subscriptionDialogOpen} 
        onOpenChange={setSubscriptionDialogOpen}
        userBrainCount={ownedBrains + sharedBrains}
        apiCallsUsed={apiCalls}
      />
    </>
  );
};

export default ProfileDialog;
