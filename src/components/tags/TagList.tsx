
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImageTag } from '@/hooks/useImageTags';

// Define tag colors for visual variety
const TAG_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
  'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
];

interface TagListProps {
  tags: ImageTag[];
  onRemoveTag: (tagId: string) => Promise<boolean>;
  filterText: string;
}

// Function to get a consistent color for a tag based on its content
const getTagColor = (tag: string) => {
  const index = tag.length % TAG_COLORS.length;
  return TAG_COLORS[index];
};

const TagList: React.FC<TagListProps> = ({ tags, onRemoveTag, filterText }) => {
  if (tags.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic px-1 w-full text-center py-2">
        {filterText ? 'No matching tags found' : 'No tags added yet'}
      </p>
    );
  }

  return (
    <>
      {tags.map(tag => (
        <Badge 
          key={tag.id} 
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 text-xs py-1 pl-2 pr-1 shadow-sm border transition-all transform hover:scale-105", 
            getTagColor(tag.tag)
          )}
        >
          {tag.tag}
          <button 
            onClick={() => onRemoveTag(tag.id)} 
            className="rounded-full hover:bg-white/30 p-0.5 transition-colors"
            aria-label={`Remove tag ${tag.tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </>
  );
};

export default TagList;
