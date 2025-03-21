
import React, { ReactNode, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ProfileButtonProps = {
  onClick: () => void;
  badge?: ReactNode;
  remainingDailyApiCalls?: number;
};

const ProfileButton = ({ onClick, badge, remainingDailyApiCalls }: ProfileButtonProps) => {
  const { user, profile } = useAuth();
  const [apiCalls, setApiCalls] = useState<number | undefined>(remainingDailyApiCalls);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  
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

  // Subscribe to real-time updates for user_usage_stats
  useEffect(() => {
    if (!user) return;

    // Fetch initial API usage data
    const fetchApiUsage = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('track-usage', {
          body: { userId: user.id }
        });
        
        if (error) {
          console.error('Error fetching API usage:', error);
        } else if (data) {
          // For starter plan: 10 calls per day limit
          const dailyLimit = 10;
          const dailyUsage = data.dailyApiCalls || 0;
          const remaining = Math.max(0, dailyLimit - dailyUsage);
          setApiCalls(remaining);
          setLimitReached(data.limitReached || remaining === 0);
        }
      } catch (error) {
        console.error('Failed to fetch API usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiUsage();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-usage-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_usage_stats',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // When a new usage record is inserted, refresh the data
          fetchApiUsage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Create API credits badge
  const apiCreditsBadge = apiCalls !== undefined ? (
    <Badge 
      variant={limitReached ? "destructive" : "outline"} 
      className={`text-xs font-normal ${limitReached ? 'bg-destructive/10' : 'bg-primary/5 hover:bg-primary/5'}`}
    >
      {limitReached ? (
        <AlertTriangle className="h-3 w-3 mr-1 text-destructive" />
      ) : (
        <Zap className="h-3 w-3 mr-1 text-primary/60" />
      )}
      <span>
        {limitReached 
          ? "Daily AI limit reached" 
          : `Daily AI API credits: ${isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : apiCalls}`
        }
      </span>
    </Badge>
  ) : badge;

  return (
    <div className="flex items-center gap-2">
      {apiCreditsBadge}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onClick}
        className="flex items-center gap-2"
      >
        <Avatar className="h-5 w-5">
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <span>Profile</span>
      </Button>
    </div>
  );
};

export default ProfileButton;
