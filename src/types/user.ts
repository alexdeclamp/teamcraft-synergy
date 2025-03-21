
export type UserStats = {
  apiCalls: number;
  dailyApiCalls: number; // New field for daily tracking
  ownedBrains: number;
  sharedBrains: number;
  documents: number;
};

export type UserFeatures = {
  canCreateBrains: boolean;
  canShareBrains: boolean;
  canUploadDocuments: boolean;
  canUseImageAnalysis: boolean;
  canUseAdvancedAI: boolean;
  maxBrains: number;
  maxApiCalls: number;
  maxDailyApiCalls: number | null; // New field
  brainLimitReached: boolean;
  apiCallsLimitReached: boolean;
  dailyApiCallsLimitReached: boolean; // New field
  remainingDailyApiCalls: number; // New field
};

export type AccountFeatureConfig = {
  [key: string]: {
    canCreateBrains: boolean;
    canShareBrains: boolean;
    canUploadDocuments: boolean;
    canUseImageAnalysis: boolean;
    canUseAdvancedAI: boolean;
    maxBrains: number | null; // null means unlimited
    maxApiCalls: number | null; // null means unlimited
    maxDailyApiCalls: number | null; // New field: null means unlimited
  }
};
