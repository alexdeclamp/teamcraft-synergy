import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LucideIcon, AlertTriangle, Lock } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FeatureAccessProps {
  feature: keyof Omit<ReturnType<typeof useUserFeatures>['userFeatures'], 'maxBrains' | 'maxApiCalls' | 'brainLimitReached' | 'apiCallsLimitReached'>;
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

const FeatureAccess: React.FC<FeatureAccessProps> = ({
  feature,
  children,
  title = 'Feature not available',
  description = 'This feature is not available on your current plan.',
  icon: Icon = Lock
}) => {
  const { userFeatures, isLoading, planType } = useUserFeatures();
  const navigate = useNavigate();
  
  // Show loading state or children while loading to prevent flicker
  if (isLoading) {
    return <>{children}</>;
  }
  
  // Show children if user has access to this feature
  if (userFeatures[feature]) {
    return <>{children}</>;
  }
  
  // Otherwise show upgrade message
  return (
    <div className="p-4 rounded-lg border border-muted bg-muted/20">
      <Alert className="mb-4">
        <Icon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{description}</p>
          <p className="text-sm">This feature is only available on the Pro plan.</p>
          
          <Button 
            variant="default" 
            size="sm" 
            className="w-fit mt-2"
            onClick={() => navigate('/subscription')}
          >
            Upgrade to Pro
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FeatureAccess;
