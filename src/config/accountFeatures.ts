
import { AccountFeatureConfig } from '@/types/user';

// Configuration for features by plan type
export const accountFeatures: AccountFeatureConfig = {
  starter: {
    canCreateBrains: true,
    canShareBrains: false,
    canUploadDocuments: true,
    canUseImageAnalysis: true,
    canUseAdvancedAI: false,
    maxBrains: 3,
    maxApiCalls: 25
  },
  pro: {
    canCreateBrains: true,
    canShareBrains: true,
    canUploadDocuments: true,
    canUseImageAnalysis: true,
    canUseAdvancedAI: true,
    maxBrains: null, // unlimited
    maxApiCalls: null // unlimited
  }
};

// Default plan if none is specified
export const defaultPlanType = 'starter';
