
import React from 'react';
import { Check, X } from 'lucide-react';
import { UserFeatures } from '@/types/user';

interface FeaturesListProps {
  userFeatures: UserFeatures;
}

// Feature item component
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

const FeaturesList = ({ userFeatures }: FeaturesListProps) => {
  return (
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
  );
};

export default FeaturesList;
