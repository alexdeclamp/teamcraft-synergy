
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserStats } from '@/components/navbar/UserStatsManager';
import { accountFeatures, defaultPlanType } from '@/config/accountFeatures';
import { UserFeatures } from '@/types/user';

export const useUserFeatures = (): {
  userFeatures: UserFeatures;
  isLoading: boolean;
  planType: string;
} => {
  const { user } = useAuth();
  const { planDetails, isLoading: isSubscriptionLoading } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [userFeatures, setUserFeatures] = useState<UserFeatures>({
    canCreateBrains: false,
    canShareBrains: false,
    canUploadDocuments: false,
    canUseImageAnalysis: false,
    canUseAdvancedAI: false,
    maxBrains: 0,
    maxApiCalls: 0,
    maxDailyApiCalls: 0,
    brainLimitReached: false,
    apiCallsLimitReached: false,
    dailyApiCallsLimitReached: false,
    remainingDailyApiCalls: 0
  });

  const [planType, setPlanType] = useState(defaultPlanType);

  useEffect(() => {
    if (!user || isSubscriptionLoading) {
      return;
    }

    try {
      // Get current plan type from subscription
      const currentPlanType = planDetails?.plan_type || defaultPlanType;
      setPlanType(currentPlanType);

      // Get user statistics
      const stats = getUserStats();
      
      console.log('User stats:', stats);
      console.log('Current plan type:', currentPlanType);
      
      // Get features configuration for this plan
      const features = accountFeatures[currentPlanType] || accountFeatures[defaultPlanType];
      
      // Calculate if limits are reached
      const brainLimitReached = 
        features.maxBrains !== null && stats.ownedBrains >= features.maxBrains;
      
      // API call limits are removed, so these are always false
      const apiCallsLimitReached = false;
      const dailyApiCallsLimitReached = false;
      
      // Calculate remaining daily API calls (now always Infinity)
      const remainingDailyApiCalls = Infinity;
      
      console.log('Brain limit reached:', brainLimitReached, 'Max brains:', features.maxBrains, 'Owned brains:', stats.ownedBrains);
      console.log('Daily API calls:', stats.dailyApiCalls, 'Max daily:', features.maxDailyApiCalls, 'Remaining:', remainingDailyApiCalls);
      
      setUserFeatures({
        ...features,
        brainLimitReached,
        apiCallsLimitReached,
        dailyApiCallsLimitReached,
        remainingDailyApiCalls,
        maxBrains: features.maxBrains || Infinity,
        maxApiCalls: Infinity,
        maxDailyApiCalls: Infinity
      });
    } catch (error) {
      console.error('Error determining user features:', error);
      // Fall back to default plan features
      const features = accountFeatures[defaultPlanType];
      setUserFeatures({
        ...features,
        brainLimitReached: false,
        apiCallsLimitReached: false,
        dailyApiCallsLimitReached: false,
        remainingDailyApiCalls: Infinity,
        maxBrains: features.maxBrains || 0,
        maxApiCalls: Infinity,
        maxDailyApiCalls: Infinity
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, planDetails, isSubscriptionLoading]);

  return { userFeatures, isLoading, planType };
};
