
export interface UserStats {
  apiCalls: number;
  ownedBrains: number;
  sharedBrains: number;
  documents: number;
}

// Extend Window interface to include our global stats
declare global {
  interface Window {
    globalUserStats?: UserStats;
  }
}
