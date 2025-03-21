
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Brain, AlertCircle, Check, X } from 'lucide-react';
import { SubscriptionTier } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserFeatures } from '@/hooks/useUserFeatures';

interface SubscriptionInfoProps {
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
  error: string | null;
  userBrainCount?: number;
  userDocumentCount?: number;
  apiCallsUsed?: number;
  upgradeToProPlan?: (priceId?: string) => Promise<void>;
  isUpgrading?: boolean;
}

const SubscriptionInfo = ({ 
  planDetails, 
  isLoading, 
  error,
  userBrainCount = 0,
  userDocumentCount = 0,
  apiCallsUsed = 0,
  upgradeToProPlan,
  isUpgrading = false
}: SubscriptionInfoProps) => {
  const { userFeatures } = useUserFeatures();
  
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

  const brainPercentage = planDetails.plan_type === 'pro' 
    ? 0 // Pro has unlimited brains, so we don't show a percentage
    : Math.min(Math.round((userBrainCount / planDetails.max_brains) * 100), 100);
    
  const apiCallsPercentage = planDetails.plan_type === 'pro' 
    ? 0 // Pro has unlimited API calls, so we don't show a percentage
    : Math.min(Math.round((apiCallsUsed / planDetails.max_api_calls) * 100), 100);

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex flex-col bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-medium">
              <Zap className="h-4 w-4 text-primary" />
              AI API Calls
            </div>
            <span className="font-medium break-normal">
              {planDetails.plan_type === 'pro' 
                ? `${apiCallsUsed} / Unlimited` 
                : `${apiCallsUsed} / ${planDetails.max_api_calls}`}
            </span>
          </div>
          {planDetails.plan_type !== 'pro' && (
            <Progress value={apiCallsPercentage} className="h-2 mb-2" />
          )}
          <span className="text-xs text-muted-foreground">Resets monthly</span>
        </div>
          
        <div className="flex flex-col bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-medium">
              <Brain className="h-4 w-4 text-primary" />
              Brains
            </div>
            <span className="font-medium break-normal">
              {planDetails.plan_type === 'pro' 
                ? `${userBrainCount} / Unlimited` 
                : `${userBrainCount} / ${planDetails.max_brains}`}
            </span>
          </div>
          {planDetails.plan_type !== 'pro' && (
            <Progress value={brainPercentage} className="h-2" />
          )}
          {planDetails.plan_type === 'starter' && (
            <span className="text-xs text-amber-500 mt-1">
              Starter plan doesn't allow sharing brains
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Available Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start">
            {userFeatures.canCreateBrains ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            }
            <div>
              <p className="font-medium">Create Brains</p>
              <p className="text-sm text-muted-foreground">Create {userFeatures.maxBrains === Infinity ? 'unlimited' : userFeatures.maxBrains} brains</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {userFeatures.canShareBrains ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            }
            <div>
              <p className="font-medium">Share Brains</p>
              <p className="text-sm text-muted-foreground">Collaborate with team members</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {userFeatures.canUploadDocuments ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            }
            <div>
              <p className="font-medium">Upload Documents</p>
              <p className="text-sm text-muted-foreground">Add PDFs and other files</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {userFeatures.canUseImageAnalysis ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            }
            <div>
              <p className="font-medium">Image Analysis</p>
              <p className="text-sm text-muted-foreground">AI-powered image processing</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {userFeatures.canUseAdvancedAI ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            }
            <div>
              <p className="font-medium">Advanced AI Features</p>
              <p className="text-sm text-muted-foreground">Enhanced AI capabilities</p>
            </div>
          </div>
          
          <div className="flex items-start">
            {userFeatures.maxApiCalls === Infinity ? 
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" /> : 
              <div className={`h-5 w-5 mr-2 mt-0.5 flex items-center justify-center 
                ${apiCallsUsed >= userFeatures.maxApiCalls ? 'text-red-500' : 'text-amber-500'}`}>
                {apiCallsUsed}/{userFeatures.maxApiCalls}
              </div>
            }
            <div>
              <p className="font-medium">API Calls</p>
              <p className="text-sm text-muted-foreground">
                {userFeatures.maxApiCalls === Infinity ? 'Unlimited' : userFeatures.maxApiCalls} AI API calls per month
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {planDetails.plan_type === 'starter' && upgradeToProPlan && (
        <Button 
          className="w-full mt-6" 
          variant="default"
          onClick={() => upgradeToProPlan()}
          disabled={isUpgrading}
        >
          {isUpgrading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : 'Upgrade to Pro'}
        </Button>
      )}
      
      {planDetails.features && planDetails.features.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Plan Details</h4>
          <ul className="space-y-1 overflow-wrap-anywhere">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span className="break-words">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
