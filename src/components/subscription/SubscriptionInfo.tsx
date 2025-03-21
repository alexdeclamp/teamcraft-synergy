
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Brain, AlertCircle, Check, X, Crown } from 'lucide-react';
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading subscription details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-amber-50 text-amber-600">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">Unable to load subscription information</span>
        </div>
        <p className="text-sm">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  if (!planDetails) {
    return null;
  }

  const isPro = planDetails.plan_type === 'pro';
  const brainPercentage = isPro ? 0 : Math.min(Math.round((userBrainCount / (planDetails.max_brains || 1)) * 100), 100);

  return (
    <div className="w-full">
      {/* Plan Header */}
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

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Brain className="h-4 w-4 text-primary mr-2" />
              <span className="font-medium">Brains</span>
            </div>
            <span>
              {userBrainCount} / {isPro ? 'Unlimited' : planDetails.max_brains}
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

      {/* Features List */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureItem 
            feature="Create Brains" 
            enabled={userFeatures.canCreateBrains}
            description={`Up to ${userFeatures.maxBrains === Infinity ? 'unlimited' : userFeatures.maxBrains} brains`}
          />
          <FeatureItem 
            feature="Share Brains" 
            enabled={userFeatures.canShareBrains}
            description="Collaborate with team members"
          />
          <FeatureItem 
            feature="Document Uploads" 
            enabled={userFeatures.canUploadDocuments}
            description="Add PDFs and other files"
          />
          <FeatureItem 
            feature="Image Analysis" 
            enabled={userFeatures.canUseImageAnalysis}
            description="AI-powered image processing"
          />
          <FeatureItem 
            feature="Advanced AI" 
            enabled={userFeatures.canUseAdvancedAI}
            description="Enhanced AI capabilities"
          />
          <FeatureItem 
            feature="API Calls" 
            enabled={true}
            description="Unlimited AI API calls"
          />
        </div>
      </div>
      
      {/* Upgrade Button */}
      {!isPro && upgradeToProPlan && (
        <Button 
          className="w-full" 
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
      
      {/* Plan Features */}
      {planDetails.features && planDetails.features.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Plan Includes</h4>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper component for feature items
const FeatureItem = ({ feature, enabled, description }: { 
  feature: string; 
  enabled: boolean;
  description: string;
}) => (
  <div className="flex items-start">
    {enabled ? (
      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
    )}
    <div>
      <p className="font-medium">{feature}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default SubscriptionInfo;
