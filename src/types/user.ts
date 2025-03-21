
export type UserStats = {
  apiCalls: number;
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
  brainLimitReached: boolean;
  apiCallsLimitReached: boolean;
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
  }
};
