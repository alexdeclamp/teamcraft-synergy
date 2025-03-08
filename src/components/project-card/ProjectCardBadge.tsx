
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectCardBadgeProps {
  status: 'active' | 'archived' | 'completed';
}

const ProjectCardBadge: React.FC<ProjectCardBadgeProps> = ({ status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <Badge variant="outline" className={cn(
      "mb-2 font-normal",
      statusColors[status]
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default ProjectCardBadge;
