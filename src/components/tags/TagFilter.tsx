
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  allTags, 
  selectedTags, 
  onTagSelect 
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      {allTags.map((tag, index) => (
        <Badge 
          key={index} 
          variant={selectedTags.includes(tag) ? "default" : "outline"}
          className={cn(
            "cursor-pointer",
            selectedTags.includes(tag) 
              ? "bg-primary hover:bg-primary/80" 
              : "hover:bg-primary/10"
          )}
          onClick={() => onTagSelect(tag)}
        >
          <Tag className="h-3 w-3 mr-1" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default TagFilter;
