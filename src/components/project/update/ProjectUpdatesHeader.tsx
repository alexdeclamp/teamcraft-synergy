
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
      <h3 className="text-xl font-semibold">Recent Updates</h3>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-1"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ProjectUpdatesHeader;
