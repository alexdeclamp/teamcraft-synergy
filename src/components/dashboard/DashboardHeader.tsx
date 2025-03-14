
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
          <Button 
            onClick={() => navigate('/new-project')}
            className="shadow-sm rounded-full flex-grow sm:flex-grow-0"
            id="new-brain-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Brain
          </Button>
          {isMobile && (
            <div className="flex items-center ml-3">
              <StartOnboardingButton className="mr-2" />
              <DashboardTutorial />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
