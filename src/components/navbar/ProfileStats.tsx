
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

type ProfileStatsProps = {
  isLoading: boolean;
  error: string | null;
  apiCalls: number;
};

const ProfileStats = ({ isLoading, error, apiCalls }: ProfileStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mb-2 text-amber-500" />
        <p className="text-sm text-center">Statistics unavailable</p>
        <p className="text-xs text-center text-muted-foreground mt-1">Try again later</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 mt-2">
      <div className="text-sm font-medium mb-1">AI Usage Statistics</div>
      <div className="flex justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">OpenAI API Calls (This Month)</span>
        <span className="text-sm">{apiCalls}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Only counts actual AI calls for document/note summarization and chat responses.
      </p>
    </div>
  );
};

export default ProfileStats;
