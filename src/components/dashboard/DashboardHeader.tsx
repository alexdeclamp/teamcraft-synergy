
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold" id="dashboard-heading">Brains</h1>
        <p className="text-muted-foreground mt-1">
          Manage and organize your team's brains
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <DashboardTutorial className="mr-2" />
        <Button 
          onClick={() => navigate('/new-project')}
          className="shadow-sm"
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
