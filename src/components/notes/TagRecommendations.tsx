
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

interface TagRecommendationsProps {
  availableTags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
}

const TagRecommendations: React.FC<TagRecommendationsProps> = ({
  availableTags,
  selectedTags,
  onSelectTag
}) => {
  // Filter out tags that are already selected
  const recommendedTags = availableTags.filter(tag => !selectedTags.includes(tag));
  
  if (recommendedTags.length === 0) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-2">
        <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Suggested tags from this project:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recommendedTags.map(tag => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors"
            onClick={() => onSelectTag(tag)}
          >
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagRecommendations;
