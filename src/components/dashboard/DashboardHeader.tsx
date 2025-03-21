
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ApiUsageAlert from './ApiUsageAlert';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { userFeatures, isLoading } = useUserFeatures();

  const brainLimitReached = !isLoading && userFeatures.brainLimitReached && userFeatures.maxBrains !== Infinity;
  
  return (
    <div className={`flex flex-col mb-4 sm:mb-8 gap-4 ${className}`}>
      {/* API Usage Alert - only show when critical */}
      <ApiUsageAlert />
      
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
          <Button 
            onClick={() => navigate('/new-project')}
            className="shadow-sm rounded-full flex-grow sm:flex-grow-0"
            id="new-brain-button"
            disabled={brainLimitReached}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Brain
          </Button>
        </div>
      </div>

      {brainLimitReached && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Brain limit reached</AlertTitle>
          <AlertDescription>
            You've reached your limit of {userFeatures.maxBrains} brains. 
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/subscription')}>
              Upgrade your plan
            </Button> to create more brains.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DashboardHeader;
