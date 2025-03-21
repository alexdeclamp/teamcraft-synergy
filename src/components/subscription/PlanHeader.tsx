
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap } from 'lucide-react';
import { SubscriptionTier } from '@/types/subscription';

interface PlanHeaderProps {
  planDetails: SubscriptionTier;
}

const PlanHeader = ({ planDetails }: PlanHeaderProps) => {
  const isPro = planDetails.plan_type === 'pro';

  return (
    <div className="bg-muted p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          {isPro ? (
            <Crown className="h-5 w-5 text-primary mr-2" />
          ) : (
            <Zap className="h-5 w-5 text-muted-foreground mr-2" />
          )}
          <h3 className="font-medium text-lg">{planDetails.name} Plan</h3>
        </div>
        <Badge 
          variant={isPro ? "default" : "secondary"}
          className={isPro ? 'bg-primary' : ''}
        >
          {isPro ? 'Pro' : 'Free'}
        </Badge>
      </div>
      {isPro && (
        <p className="text-sm text-muted-foreground">${planDetails.price}/month</p>
      )}
    </div>
  );
};

export default PlanHeader;
