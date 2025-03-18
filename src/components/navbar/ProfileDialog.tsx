
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
import { Settings, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import ProfileStats from './ProfileStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Get user initials for avatar fallback
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
        
        // Call the user-statistics edge function
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
        
        // Set the statistics
        setApiCalls(data.apiCalls ?? 0);
        setOwnedBrainCount(data.ownedBrains ?? 0);
        setSharedBrainCount(data.sharedBrains ?? 0);
        setDocumentCount(data.documents ?? 0);
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
          <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
          
          <div className="w-full space-y-2">
            <div className="flex justify-between p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">Account Type</span>
              <span className="text-sm">Free</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          
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
  );
};

export default ProfileDialog;
