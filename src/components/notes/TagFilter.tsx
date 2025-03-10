
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  allTags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, activeTag, setActiveTag }) => {
  if (allTags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 bg-accent/10 p-3 rounded-md">
      <Tag className="h-4 w-4 text-muted-foreground mr-1" />
      <span className="text-sm font-medium mr-2">Filter by tag:</span>
      <Button 
        variant={activeTag === null ? "secondary" : "outline"} 
        size="sm" 
        onClick={() => setActiveTag(null)} 
        className="h-7 text-xs"
      >
        All
      </Button>
      {allTags.map(tag => (
        <Button 
          key={tag} 
          variant={activeTag === tag ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setActiveTag(activeTag === tag ? null : tag)} 
          className="h-7 text-xs"
        >
          #{tag}
        </Button>
      ))}
    </div>
  );
};

export default TagFilter;
