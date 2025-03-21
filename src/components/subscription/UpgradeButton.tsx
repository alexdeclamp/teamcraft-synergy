
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
  upgradeToProPlan: () => Promise<void>;
  isUpgrading: boolean;
}

const UpgradeButton = ({ upgradeToProPlan, isUpgrading }: UpgradeButtonProps) => {
  return (
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
  );
};

export default UpgradeButton;
