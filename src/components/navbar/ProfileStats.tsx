
import React from 'react';
import { Loader2 } from 'lucide-react';

type ProfileStatsProps = {
  isLoading: boolean;
  activeBrains: number;
  apiCalls: number;
  storageUsed: string;
};

const ProfileStats = ({ isLoading, activeBrains, apiCalls, storageUsed }: ProfileStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 mt-2">
      <div className="text-sm font-medium mb-1">Usage Statistics</div>
      <div className="flex justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">Active Brains</span>
        <span className="text-sm">{activeBrains}</span>
      </div>
      <div className="flex justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">API Calls (This Month)</span>
        <span className="text-sm">{apiCalls}</span>
      </div>
      <div className="flex justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">Storage Used</span>
        <span className="text-sm">{storageUsed}</span>
      </div>
    </div>
  );
};

export default ProfileStats;
