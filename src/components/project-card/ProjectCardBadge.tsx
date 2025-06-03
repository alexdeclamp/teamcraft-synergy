
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectCardBadgeProps {
  text: string;
}

const ProjectCardBadge: React.FC<ProjectCardBadgeProps> = ({ text }) => {
  const getStatusColors = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('completed')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerText.includes('archived')) {
      return 'bg-gray-100 text-gray-800';
    } else if (lowerText.includes('progress')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Badge variant="outline" className={cn(
      "mb-2 font-normal",
      getStatusColors(text)
    )}>
      {text}
    </Badge>
  );
};

export { ProjectCardBadge };
export default ProjectCardBadge;
