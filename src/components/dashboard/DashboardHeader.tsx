
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';
import PlanLimitBanner from '@/components/subscription/PlanLimitBanner';
import { getUserStats } from '@/components/navbar/UserStatsManager';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { checkUserLimits, upgradeToProPlan, isUpgrading, planDetails, refetch: refetchSubscription } = useSubscription();
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [checkAttempted, setCheckAttempted] = useState(false);

  // Force initial check
  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  // Check brain limits when component mounts or when planDetails changes
  useEffect(() => {
    let isMounted = true;
    
    const checkBrainLimits = async () => {
      if (!isMounted) return;
      
      setIsCheckingLimits(true);
      
      try {
        console.log('Checking brain limits');
        const result = await checkUserLimits('brain');
        
        if (!isMounted) return;
        
        if (result) {
          console.log('Brain limit check result:', result);
          setLimitReached(!result.canProceed);
          setLimitMessage(result.message || "You've reached your brain limit on the Starter plan. Please upgrade to Pro for unlimited brains.");
        }
        setCheckAttempted(true);
      } catch (error) {
        console.error('Error checking brain limits:', error);
        
        if (!isMounted) return;
        
        setCheckAttempted(true);
        
        // Fallback to plan-based check
        if (planDetails) {
          checkBasedOnPlanDetails();
        }
      } finally {
        if (isMounted) {
          setIsCheckingLimits(false);
        }
      }
    };
    
    const checkBasedOnPlanDetails = () => {
      if (!planDetails || !isMounted) return;
      
      console.log('Checking limits based on plan details:', planDetails);
      
      try {
        // If we're on the starter plan, check limits using static plan details
        if (planDetails.plan_type === 'starter') {
          const stats = getUserStats();
          console.log('Current user stats:', stats);
          
          if (stats && stats.ownedBrains >= planDetails.max_brains) {
            setLimitReached(true);
            setLimitMessage(`You've reached the maximum limit of ${planDetails.max_brains} brains on your Starter plan. Please upgrade to Pro for unlimited brains.`);
          } else {
            setLimitReached(false);
          }
        } else if (planDetails.plan_type === 'pro') {
          // If we're on the pro plan, we shouldn't have limits
          setLimitReached(false);
        }
      } catch (error) {
        console.error('Error in plan details check:', error);
        // If we can't get stats, better to show the button than block the user
        setLimitReached(false);
      }
    };
    
    // Run check immediately
    checkBrainLimits();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
  }, [checkUserLimits, planDetails]);

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
          
          {isCheckingLimits && !checkAttempted ? (
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
      
      {/* Always display banner if limit is reached, regardless of checking state */}
      {limitReached && (
        <PlanLimitBanner 
          message={limitMessage} 
          onUpgrade={() => upgradeToProPlan()} 
        />
      )}
    </div>
  );
};

export default DashboardHeader;
