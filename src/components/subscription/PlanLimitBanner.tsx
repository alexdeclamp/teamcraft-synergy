
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanLimitBannerProps {
  message: string;
  onUpgrade: () => void;
}

const PlanLimitBanner: React.FC<PlanLimitBannerProps> = ({ 
  message,
  onUpgrade
}) => {
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start">
          <Zap className="h-4 w-4 text-amber-600 mt-1 mr-2 flex-shrink-0" />
          <div>
            <AlertTitle className="text-amber-800 mb-1">Plan Limit Reached</AlertTitle>
            <AlertDescription className="text-amber-700">{message}</AlertDescription>
          </div>
        </div>
        <Button 
          className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 mt-2 sm:mt-0"
          onClick={onUpgrade}
        >
          Upgrade to Pro
        </Button>
      </div>
    </Alert>
  );
};

export default PlanLimitBanner;
