
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface ProjectUpdatesHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ProjectUpdatesHeader: React.FC<ProjectUpdatesHeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">Recent Updates</h3>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ProjectUpdatesHeader;
