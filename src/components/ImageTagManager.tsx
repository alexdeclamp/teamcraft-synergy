
import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { useImageTags } from '@/hooks/useImageTags';
import TagList from '@/components/tags/TagList';
import TagInput from '@/components/tags/TagInput';
import TagFilter from '@/components/tags/TagFilter';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ImageTagManagerProps {
  imageUrl: string;
  projectId: string | undefined;
}

const ImageTagManager: React.FC<ImageTagManagerProps> = ({ imageUrl, projectId }) => {
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  
  const {
    tags,
    filteredTags,
    filterText,
    setFilterText,
    sortOption,
    setSortOption,
    addTag,
    removeTag
  } = useImageTags(imageUrl, projectId);

  return (
    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-7 w-7 relative transition-all",
            tags.length > 0 && "after:content-[''] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-primary after:rounded-full"
          )}
          title={tags.length > 0 ? `${tags.length} Tags` : "Add Tags"}
        >
          <Tag className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 animate-scale-in" side="top">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Image Tags
              {tags.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 h-5">
                  {tags.length}
                </Badge>
              )}
            </h3>
          </div>
          
          {/* Tag Filter Component */}
          <TagFilter 
            filterText={filterText}
            setFilterText={setFilterText}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
          
          {/* Tag List Component */}
          <div className="flex flex-wrap gap-1.5 min-h-[40px] max-h-[120px] overflow-y-auto p-1 rounded-md border bg-background/50">
            <TagList 
              tags={filteredTags} 
              onRemoveTag={removeTag}
              filterText={filterText}
            />
          </div>
          
          {/* Tag Input Component */}
          <div className="flex items-center gap-2">
            <TagInput onAddTag={addTag} />
          </div>
          
          <p className="text-[10px] text-muted-foreground mt-2">
            Tags help organize and find images in your project
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImageTagManager;
