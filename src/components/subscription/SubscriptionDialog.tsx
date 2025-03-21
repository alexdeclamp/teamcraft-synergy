
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SubscriptionInfo from './SubscriptionInfo';
import ProPlanBenefits from './ProPlanBenefits';
import { useSubscription } from '@/hooks/useSubscription';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBrainCount: number;
  apiCallsUsed: number;
}

const SubscriptionDialog = ({ 
  open, 
  onOpenChange,
  userBrainCount = 0,
  apiCallsUsed = 0
}: SubscriptionDialogProps) => {
  const { planDetails, isLoading, error, upgradeToProPlan, isUpgrading } = useSubscription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              View your current plan and usage
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mt-4 px-1">
          <SubscriptionInfo 
            planDetails={planDetails} 
            isLoading={isLoading} 
            error={error}
            userBrainCount={userBrainCount}
            apiCallsUsed={apiCallsUsed}
            upgradeToProPlan={upgradeToProPlan}
            isUpgrading={isUpgrading}
          />
          
          {planDetails?.plan_type !== 'pro' && <ProPlanBenefits />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
