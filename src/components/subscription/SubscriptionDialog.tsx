
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
  const { planDetails, isLoading, error } = useSubscription();

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
          />
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Subscription Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span>Upgrade to unlimited API calls per month</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span>Create and manage unlimited brains</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span>Share your brains with team members</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                <span>Priority support and early access to new features</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
