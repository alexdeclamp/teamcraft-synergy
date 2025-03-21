
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserFeatures } from '@/hooks/useUserFeatures';

const ApiUsageAlert = () => {
  const { userFeatures, isLoading, planType } = useUserFeatures();
  const navigate = useNavigate();
  
  // Only show alerts for starter plan users who have critical usage situations
  if (isLoading || planType !== 'starter' || userFeatures.remainingDailyApiCalls === Infinity) {
    return null;
  }
  
  // Only show alerts for critical situations - when limit reached or very low remaining
  if (userFeatures.dailyApiCallsLimitReached) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Zap className="h-4 w-4" />
        <AlertTitle>Daily API limit reached</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>You've used all your 10 daily AI API calls.</span>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto bg-background"
            onClick={() => navigate('/subscription')}
          >
            Upgrade to Pro for unlimited API calls
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Low remaining calls warning (2 or fewer)
  if (userFeatures.remainingDailyApiCalls <= 2) {
    return (
      <Alert variant="warning" className="mb-4">
        <Zap className="h-4 w-4" />
        <AlertTitle>Low API credits remaining</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>You have only <strong>{userFeatures.remainingDailyApiCalls}</strong> AI API calls left today.</span>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => navigate('/subscription')}
          >
            Upgrade to Pro for unlimited API calls
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // For normal remaining calls, don't show any alert - we show the badge in the header instead
  return null;
};

export default ApiUsageAlert;
