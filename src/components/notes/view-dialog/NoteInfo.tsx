
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface NoteInfoProps {
  updatedAt: string;
  createdAt: string;
  tags?: string[];
  formatDate?: (dateString: string) => string;
}

const NoteInfo: React.FC<NoteInfoProps> = ({ 
  updatedAt, 
  createdAt, 
  tags, 
  formatDate 
}) => {
  const formatDateFn = (dateString: string) => {
    if (formatDate) return formatDate(dateString);
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
      <span>{formatDateFn(updatedAt || createdAt)}</span>
      
      {tags && tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-1 mt-1 sm:mt-0 sm:ml-2">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteInfo;
