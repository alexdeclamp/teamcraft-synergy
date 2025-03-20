
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';
import PlanLimitBanner from '@/components/subscription/PlanLimitBanner';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { checkUserLimits, upgradeToProPlan, isUpgrading, planDetails } = useSubscription();
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  // Check brain limits when component mounts
  useEffect(() => {
    const checkBrainLimits = async () => {
      setIsCheckingLimits(true);
      const result = await checkUserLimits('brain');
      
      // Only set it to false if we actually have a result
      if (result) {
        setLimitReached(!result.canProceed);
        setLimitMessage(result.message || "You've reached your brain limit on the Starter plan. Please upgrade to Pro for unlimited brains.");
      }
      
      setIsCheckingLimits(false);
    };
    
    checkBrainLimits();
    
    // Add an interval to periodically check brain limits
    const intervalId = setInterval(checkBrainLimits, 10000);
    
    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [checkUserLimits]);
  
  // Additional check based on plan details
  useEffect(() => {
    if (planDetails && !isCheckingLimits) {
      // If we're on the starter plan, double check limits using static plan details
      if (planDetails.plan_type === 'starter') {
        const userStats = getUserStats();
        if (userStats.ownedBrains >= planDetails.max_brains) {
          setLimitReached(true);
          setLimitMessage(`You've reached the maximum limit of ${planDetails.max_brains} brains on your Starter plan. Please upgrade to Pro for unlimited brains.`);
        }
      } else if (planDetails.plan_type === 'pro') {
        // If we're on the pro plan, we shouldn't have limits
        setLimitReached(false);
      }
    }
  }, [planDetails, isCheckingLimits]);

  return (
    <div className={`flex flex-col mb-4 sm:mb-8 gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold" id="dashboard-heading">Brains</h1>
            <Sparkles className="h-5 w-5 text-primary/70" />
          </div>
          <p className="text-muted-foreground mt-1">
            Manage and organize your intelligent workspaces
          </p>
        </div>
        
        <div className={`flex items-center ${isMobile ? 'mt-4 justify-between' : 'space-x-2'} w-full sm:w-auto`}>
          {!isMobile && <StartOnboardingButton className="mr-2" />}
          {!isMobile && <DashboardTutorial className="mr-2" />}
          
          {isCheckingLimits ? (
            <Button disabled className="shadow-sm rounded-full flex-grow sm:flex-grow-0">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </Button>
          ) : limitReached ? (
            <Button 
              onClick={() => upgradeToProPlan()}
              className="shadow-sm rounded-full flex-grow sm:flex-grow-0"
              disabled={isUpgrading}
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/new-project')}
              className="shadow-sm rounded-full flex-grow sm:flex-grow-0"
              id="new-brain-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Brain
            </Button>
          )}
        </div>
      </div>
      
      {/* Display banner if limit is reached */}
      {limitReached && !isCheckingLimits && (
        <PlanLimitBanner 
          message={limitMessage} 
          onUpgrade={() => upgradeToProPlan()} 
        />
      )}
    </div>
  );
};

// Helper function to get user stats
const getUserStats = () => {
  try {
    // Import the function from navbar module
    return require('@/components/navbar/UserStatsManager').getUserStats();
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { ownedBrains: 0, sharedBrains: 0, apiCalls: 0, documents: 0 };
  }
};

export default DashboardHeader;
