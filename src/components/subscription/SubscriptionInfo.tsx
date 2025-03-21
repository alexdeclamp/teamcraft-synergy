
import React from 'react';
import { SubscriptionTier } from '@/types/subscription';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import PlanHeader from './PlanHeader';
import UsageSummary from './UsageSummary';
import FeaturesList from './FeaturesList';
import PlanFeatures from './PlanFeatures';
import UpgradeButton from './UpgradeButton';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface SubscriptionInfoProps {
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
  error: string | null;
  userBrainCount?: number;
  userDocumentCount?: number;
  apiCallsUsed?: number;
  upgradeToProPlan?: (priceId?: string) => Promise<void>;
  isUpgrading?: boolean;
}

const SubscriptionInfo = ({ 
  planDetails, 
  isLoading, 
  error,
  userBrainCount = 0,
  userDocumentCount = 0,
  apiCallsUsed = 0,
  upgradeToProPlan,
  isUpgrading = false
}: SubscriptionInfoProps) => {
  const { userFeatures } = useUserFeatures();
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!planDetails) {
    return null;
  }

  const isPro = planDetails.plan_type === 'pro';

  return (
    <div className="w-full">
      <PlanHeader planDetails={planDetails} />
      
      <UsageSummary 
        userBrainCount={userBrainCount}
        apiCallsUsed={apiCallsUsed}
        maxBrains={planDetails.max_brains}
        isPro={isPro}
      />
      
      <FeaturesList userFeatures={userFeatures} />
      
      {!isPro && upgradeToProPlan && (
        <UpgradeButton 
          upgradeToProPlan={upgradeToProPlan} 
          isUpgrading={isUpgrading} 
        />
      )}
      
      <PlanFeatures features={planDetails.features || []} />
    </div>
  );
};

export default SubscriptionInfo;
