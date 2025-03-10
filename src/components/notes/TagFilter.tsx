
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
    <div className="flex flex-wrap items-center gap-2 mb-5 bg-gradient-to-r from-accent/10 to-accent/5 p-3 rounded-md shadow-sm">
      <Tag className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium mr-1 text-slate-700">Filter by tag:</span>
      <Button 
        variant={activeTag === null ? "secondary" : "outline"} 
        size="sm" 
        onClick={() => setActiveTag(null)} 
        className="h-7 text-xs rounded-full"
      >
        All
      </Button>
      {allTags.map(tag => (
        <Button 
          key={tag} 
          variant={activeTag === tag ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setActiveTag(activeTag === tag ? null : tag)} 
          className="h-7 text-xs rounded-full hover:bg-accent/10 transition-colors"
        >
          #{tag}
        </Button>
      ))}
    </div>
  );
};

export default TagFilter;
