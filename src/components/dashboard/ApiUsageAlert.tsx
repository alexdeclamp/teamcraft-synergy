
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserFeatures } from '@/hooks/useUserFeatures';

const ApiUsageAlert = () => {
  const { userFeatures, isLoading, planType } = useUserFeatures();
  const navigate = useNavigate();
  
  // Only show for starter plan users who haven't reached their daily limit
  if (isLoading || planType !== 'starter' || userFeatures.remainingDailyApiCalls === Infinity) {
    return null;
  }
  
  // Show different versions based on remaining calls
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
  
  // Low remaining calls warning (3 or fewer)
  if (userFeatures.remainingDailyApiCalls <= 3) {
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
  
  // Normal display for users with >3 remaining calls
  return (
    <Alert variant="default" className="mb-4 border-primary/30 bg-primary/5">
      <Zap className="h-4 w-4 text-primary" />
      <AlertTitle>API Credits Available</AlertTitle>
      <AlertDescription>
        You have <strong>{userFeatures.remainingDailyApiCalls}</strong> AI API calls remaining today. Use them for summaries, chat responses, or image analysis.
      </AlertDescription>
    </Alert>
  );
};

export default ApiUsageAlert;
