
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Brain, FileText, AlertCircle } from 'lucide-react';
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
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading subscription details...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>Subscription Error</span>
          </CardTitle>
          <CardDescription className="text-amber-600">
            Could not load subscription information. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!planDetails) {
    return null;
  }

  // Calculate percentages for progress bars
  const brainPercentage = Math.min(Math.round((userBrainCount / planDetails.max_brains) * 100), 100);
  const documentPercentage = Math.min(Math.round((userDocumentCount / planDetails.max_documents) * 100), 100);
  const apiCallsPercentage = Math.min(Math.round((apiCallsUsed / planDetails.max_api_calls) * 100), 100);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Your Subscription
          </CardTitle>
          <Badge 
            variant={planDetails.plan_type === 'pro' ? "default" : "secondary"}
            className={`${planDetails.plan_type === 'pro' ? 'bg-primary' : ''} text-sm px-3 py-1`}
          >
            {planDetails.name}
          </Badge>
        </div>
        <CardDescription>
          {planDetails.plan_type === 'starter' 
            ? "You're on our free starter plan. Upgrade for more features!" 
            : "Thanks for being a Pro subscriber!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-primary" />
                AI API Calls
              </div>
              <span className="text-sm font-medium">
                {apiCallsUsed} / {planDetails.max_api_calls}
              </span>
            </div>
            <Progress value={apiCallsPercentage} className="h-2 mb-1" />
            <span className="text-xs text-muted-foreground">Resets monthly</span>
          </div>
          
          <div className="flex flex-col bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="h-4 w-4 text-primary" />
                Brains
              </div>
              <span className="text-sm font-medium">
                {userBrainCount} / {planDetails.max_brains}
              </span>
            </div>
            <Progress value={brainPercentage} className="h-2" />
          </div>
          
          <div className="flex flex-col bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Documents
              </div>
              <span className="text-sm font-medium">
                {userDocumentCount} / {planDetails.max_documents}
              </span>
            </div>
            <Progress value={documentPercentage} className="h-2 mb-1" />
            <span className="text-xs text-muted-foreground">Per brain limit</span>
          </div>
        </div>
        
        {planDetails.plan_type === 'starter' && (
          <Button className="w-full mt-4" variant="default">
            Upgrade to Pro
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;
