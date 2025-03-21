
import React from 'react';
import { Loader2, AlertCircle, Brain, FileText, Zap, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type ProfileStatsProps = {
  isLoading: boolean;
  error: string | null;
  apiCalls: number;
  dailyApiCalls: number;
  ownedBrains?: number;
  sharedBrains?: number;
  documents?: number;
};

const ProfileStats = ({ 
  isLoading, 
  error, 
  apiCalls, 
  dailyApiCalls,
  ownedBrains = 0, 
  sharedBrains = 0, 
  documents = 0 
}: ProfileStatsProps) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-2 mt-4">
        <div className="text-sm font-medium mb-1">Usage Statistics</div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
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
    <div className="w-full space-y-2 mt-4">
      <div className="text-sm font-medium mb-1">Usage Statistics</div>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Your Brains</span>
          </div>
          <span className="text-sm">{ownedBrains}</span>
        </div>
        
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Shared Brains</span>
          </div>
          <span className="text-sm">{sharedBrains}</span>
        </div>
        
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Stored Documents</span>
          </div>
          <span className="text-sm">{documents}</span>
        </div>
        
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI API Calls (Today)</span>
          </div>
          <span className="text-sm">{dailyApiCalls}</span>
        </div>
        
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI API Calls (This Month)</span>
          </div>
          <span className="text-sm">{apiCalls}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Only counts actual AI calls for document/note summarization and chat responses.
      </p>
    </div>
  );
};

export default ProfileStats;
