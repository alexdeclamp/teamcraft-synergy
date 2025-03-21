
import { AccountFeatureConfig } from '@/types/user';

// Configuration for features by plan type
export const accountFeatures: AccountFeatureConfig = {
  starter: {
    canCreateBrains: true,
    canShareBrains: false,
    canUploadDocuments: true,
    canUseImageAnalysis: true,
    canUseAdvancedAI: false,
    maxBrains: 2, // Changed from 3 to 2
    maxApiCalls: null, // Keep this as null (unlimited)
    maxDailyApiCalls: null // Keep this as null (unlimited)
  },
  pro: {
    canCreateBrains: true,
    canShareBrains: true,
    canUploadDocuments: true,
    canUseImageAnalysis: true,
    canUseAdvancedAI: true,
    maxBrains: null, // unlimited
    maxApiCalls: null, // unlimited
    maxDailyApiCalls: null // unlimited daily calls
  }
};

// Default plan if none is specified
export const defaultPlanType = 'starter';
