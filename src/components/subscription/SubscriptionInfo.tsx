
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Brain, AlertCircle } from 'lucide-react';
import { SubscriptionTier } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SubscriptionInfoProps {
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
  error: string | null;
  userBrainCount?: number;
  userDocumentCount?: number;
  apiCallsUsed?: number;
}

const SubscriptionInfo = ({ 
  planDetails, 
  isLoading, 
  error,
  userBrainCount = 0,
  userDocumentCount = 0,
  apiCallsUsed = 0
}: SubscriptionInfoProps) => {
  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading subscription details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-amber-600">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Subscription Error</span>
        </div>
        <p className="text-sm">
          Could not load subscription information. Please try again later.
        </p>
      </div>
    );
  }

  if (!planDetails) {
    return null;
  }

  // Calculate percentages for progress bars
  const brainPercentage = Math.min(Math.round((userBrainCount / planDetails.max_brains) * 100), 100);
  const apiCallsPercentage = Math.min(Math.round((apiCallsUsed / planDetails.max_api_calls) * 100), 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
          <div className="flex items-center">
            <h3 className="text-lg font-medium mr-2">{planDetails.name}</h3>
            <Badge 
              variant={planDetails.plan_type === 'pro' ? "default" : "secondary"}
              className={`${planDetails.plan_type === 'pro' ? 'bg-primary' : ''} text-xs px-2 py-0.5`}
            >
              <Zap className="h-3 w-3 mr-1" />
              {planDetails.plan_type}
            </Badge>
          </div>
        </div>
        {planDetails.plan_type === 'pro' && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Subscription Price</p>
            <p className="font-medium">${planDetails.price}/month</p>
          </div>
        )}
      </div>
        
      <div className="space-y-6 mt-6">
        <div className="flex flex-col bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-medium">
              <Zap className="h-4 w-4 text-primary" />
              AI API Calls
            </div>
            <span className="font-medium">
              {apiCallsUsed} / {planDetails.max_api_calls}
            </span>
          </div>
          <Progress value={apiCallsPercentage} className="h-2 mb-2" />
          <span className="text-xs text-muted-foreground">Resets monthly</span>
        </div>
          
        <div className="flex flex-col bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-medium">
              <Brain className="h-4 w-4 text-primary" />
              Brains
            </div>
            <span className="font-medium">
              {userBrainCount} / {planDetails.max_brains}
            </span>
          </div>
          <Progress value={brainPercentage} className="h-2" />
        </div>
      </div>
      
      {planDetails.plan_type === 'starter' && (
        <Button className="w-full mt-6" variant="default">
          Upgrade to Pro
        </Button>
      )}
      
      {planDetails.features && planDetails.features.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Plan Features</h4>
          <ul className="space-y-1">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
