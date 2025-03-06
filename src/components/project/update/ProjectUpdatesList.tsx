
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import ProjectUpdateItem from './ProjectUpdateItem';
import { Update } from './types';

interface ProjectUpdatesListProps {
  updates: Update[];
  isLoading: boolean;
  userId?: string;
  onUpdateRemoved: (updateId: string) => void;
}

const ProjectUpdatesList: React.FC<ProjectUpdatesListProps> = ({ 
  updates, 
  isLoading, 
  userId,
  onUpdateRemoved
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed rounded-md">
        <p>No updates yet</p>
        <p className="text-sm mt-1">Be the first to share an update</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4">
        {updates.map((update, index) => (
          <ProjectUpdateItem 
            key={update.id}
            update={update}
            isLast={index === updates.length - 1}
            userId={userId}
            onRemove={onUpdateRemoved}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProjectUpdatesList;
