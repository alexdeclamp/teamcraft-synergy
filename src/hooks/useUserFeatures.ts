
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
    brainLimitReached: false,
    apiCallsLimitReached: false
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
      
      // Get features configuration for this plan
      const features = accountFeatures[currentPlanType] || accountFeatures[defaultPlanType];
      
      // Calculate if limits are reached
      const brainLimitReached = 
        features.maxBrains !== null && stats.ownedBrains >= features.maxBrains;
      
      const apiCallsLimitReached = 
        features.maxApiCalls !== null && stats.apiCalls >= features.maxApiCalls;
      
      setUserFeatures({
        ...features,
        brainLimitReached,
        apiCallsLimitReached,
        maxBrains: features.maxBrains || Infinity,
        maxApiCalls: features.maxApiCalls || Infinity
      });
    } catch (error) {
      console.error('Error determining user features:', error);
      // Fall back to default plan features
      const features = accountFeatures[defaultPlanType];
      setUserFeatures({
        ...features,
        brainLimitReached: false,
        apiCallsLimitReached: false,
        maxBrains: features.maxBrains || 0,
        maxApiCalls: features.maxApiCalls || 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, planDetails, isSubscriptionLoading]);

  return { userFeatures, isLoading, planType };
};
