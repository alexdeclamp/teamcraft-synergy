
import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UsageSummaryProps {
  userBrainCount: number;
  apiCallsUsed: number;
  maxBrains: number | null;
  isPro: boolean;
}

const UsageSummary = ({ 
  userBrainCount, 
  apiCallsUsed, 
  maxBrains, 
  isPro 
}: UsageSummaryProps) => {
  const brainPercentage = !isPro && maxBrains 
    ? Math.min(Math.round((userBrainCount / maxBrains) * 100), 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Brain className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium">Brains</span>
          </div>
          <span>
            {userBrainCount} / {isPro ? 'Unlimited' : maxBrains}
          </span>
        </div>
        {!isPro && (
          <Progress value={brainPercentage} className="h-2" />
        )}
      </div>
      
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium">AI API Calls</span>
          </div>
          <span>{apiCallsUsed} / Unlimited</span>
        </div>
      </div>
    </div>
  );
};

export default UsageSummary;
