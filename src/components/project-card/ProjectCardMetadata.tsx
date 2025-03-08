
import React from 'react';
import { Calendar, Users, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectCardMetadataProps {
  createdAt: string;
  memberCount: number;
  tags?: string[];
}

const ProjectCardMetadata: React.FC<ProjectCardMetadataProps> = ({
  createdAt,
  memberCount,
  tags = [],
}) => {
  const createdDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{createdDate}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <div className="flex items-center text-xs text-muted-foreground mr-1">
            <Tag className="h-3 w-3 mr-1" />
          </div>
          {tags.map((tag, index) => (
            <Badge 
              key={`${tag}-${index}`} 
              variant="secondary" 
              className="text-xs px-2 py-0 bg-secondary/40"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectCardMetadata;
