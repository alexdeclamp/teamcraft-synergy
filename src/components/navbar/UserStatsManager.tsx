
import React, { useEffect, useState } from 'react';
import { UserStats } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProfileStats from './ProfileStats';

interface UserStatsManagerProps {
  userId: string | undefined;
  isOpen: boolean;
}

// Initialize global stats with default values
const globalUserStats: UserStats = {
  apiCalls: 0,
  ownedBrains: 0,
  sharedBrains: 0,
  documents: 0
};

// Also expose via window for other components to access directly
if (typeof window !== 'undefined') {
  window.globalUserStats = globalUserStats;
}

export const getUserStats = (): UserStats => {
  if (typeof window !== 'undefined' && window.globalUserStats) {
    return window.globalUserStats;
  }
  return globalUserStats;
};

const UserStatsManager: React.FC<UserStatsManagerProps> = ({ userId, isOpen }) => {
  const [statsLoading, setStatsLoading] = useState(true);
  const [apiCalls, setApiCalls] = useState(0);
  const [ownedBrainCount, setOwnedBrainCount] = useState(0);
  const [sharedBrainCount, setSharedBrainCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserStats = async () => {
      if (!userId || !isOpen) return;
      
      setStatsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching user statistics...');
        
        const { data, error: functionError } = await supabase.functions.invoke('user-statistics', {
          body: { userId },
        });
        
        if (!isMounted) return;
        
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
        
        if (isMounted) {
          setApiCalls(apiCallsCount);
          setOwnedBrainCount(ownedBrains);
          setSharedBrainCount(sharedBrains);
          setDocumentCount(docs);
          
          // Update global stats
          globalUserStats.apiCalls = apiCallsCount;
          globalUserStats.ownedBrains = ownedBrains;
          globalUserStats.sharedBrains = sharedBrains;
          globalUserStats.documents = docs;
          
          // Also update window property
          if (typeof window !== 'undefined') {
            window.globalUserStats = { ...globalUserStats };
          }
        }
        
      } catch (error) {
        console.error('Error fetching user stats:', error);
        if (isMounted) {
          setError('An unexpected error occurred');
          toast.error('Failed to load user statistics');
        }
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchUserStats();
    
    return () => {
      isMounted = false;
    };
  }, [userId, isOpen]);

  return (
    <ProfileStats 
      isLoading={statsLoading}
      error={error}
      apiCalls={apiCalls}
      ownedBrains={ownedBrainCount}
      sharedBrains={sharedBrainCount}
      documents={documentCount}
    />
  );
};

export default UserStatsManager;
