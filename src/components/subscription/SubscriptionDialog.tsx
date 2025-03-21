
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SubscriptionInfo from './SubscriptionInfo';
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
          
          {planDetails?.plan_type !== 'pro' && (
            <div className="mt-8 p-4 bg-primary/5 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Pro Plan Benefits</h3>
              <ul className="space-y-2">
                <BenefitItem text="Unlimited AI calls per month" />
                <BenefitItem text="Create and manage unlimited brains" />
                <BenefitItem text="Share brains with team members" />
                <BenefitItem text="Early access to new features" />
                <BenefitItem text="Priority support" />
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BenefitItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
    <span>{text}</span>
  </li>
);

export default SubscriptionDialog;
