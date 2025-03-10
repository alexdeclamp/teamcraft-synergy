
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-8 gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold" id="dashboard-heading">Brains</h1>
          <Sparkles className="h-5 w-5 text-primary/70" />
        </div>
        <p className="text-muted-foreground mt-1">
          Manage and organize your intelligent workspaces
        </p>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <StartOnboardingButton className="mr-2" />
        <DashboardTutorial className="mr-2" />
        <Button 
          onClick={() => navigate('/new-project')}
          className="shadow-sm rounded-full w-full sm:w-auto"
          id="new-brain-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Brain
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
