
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag, X, Plus, Filter, ArrowUpAZ, ArrowDownAZ, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageTag {
  id: string;
  tag: string;
}

interface ImageTagManagerProps {
  imageUrl: string;
  projectId: string | undefined;
}

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

type SortOption = 'a-z' | 'z-a' | 'newest' | 'oldest';

const ImageTagManager: React.FC<ImageTagManagerProps> = ({ imageUrl, projectId }) => {
  const [tags, setTags] = useState<ImageTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<ImageTag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('a-z');
  const { user } = useAuth();

  useEffect(() => {
    if (imageUrl && projectId) {
      fetchImageTags();
    }
  }, [imageUrl, projectId]);

  // Apply filtering and sorting whenever tags, filterText, or sortOption changes
  useEffect(() => {
    let result = [...tags];
    
    // Apply filter
    if (filterText) {
      result = result.filter(tag => 
        tag.tag.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'a-z':
        result = result.sort((a, b) => a.tag.localeCompare(b.tag));
        break;
      case 'z-a':
        result = result.sort((a, b) => b.tag.localeCompare(a.tag));
        break;
      case 'newest':
        // We don't have a created_at field in our data model, so we'll use the array order
        // which is already sorted by most recently added (since we add new tags to the beginning)
        break;
      case 'oldest':
        // Reverse the array for oldest first
        result = [...result].reverse();
        break;
    }
    
    setFilteredTags(result);
  }, [tags, filterText, sortOption]);

  const fetchImageTags = async () => {
    try {
      console.log('Fetching tags for image:', imageUrl);
      
      const { data, error } = await supabase
        .from('image_tags')
        .select('id, tag')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching image tags:', error);
        return;
      }

      console.log('Image tags data:', data);
      
      if (data) {
        // Ensure data is of the right type by mapping it
        const typedTags: ImageTag[] = data.map(item => ({
          id: item.id,
          tag: item.tag
        }));
        setTags(typedTags);
      }
    } catch (error) {
      console.error('Error checking for existing tags:', error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim() || !projectId || !user) return;
    
    try {
      console.log('Adding new tag:', newTag.trim());
      console.log('For image:', imageUrl);
      console.log('In project:', projectId);
      
      const { data, error } = await supabase
        .from('image_tags')
        .insert({
          project_id: projectId,
          image_url: imageUrl,
          tag: newTag.trim(),
          user_id: user.id
        })
        .select('id, tag')
        .single();

      if (error) {
        console.error('Error adding tag:', error);
        toast.error('Failed to add tag');
        return;
      }

      console.log('Tag added successfully:', data);
      
      // Ensure the new tag has the correct type
      const newTagObject: ImageTag = {
        id: data.id,
        tag: data.tag
      };
      
      setTags([...tags, newTagObject]);
      setNewTag('');
      toast.success('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      console.log('Removing tag with ID:', tagId);
      
      const { error } = await supabase
        .from('image_tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        console.error('Error removing tag:', error);
        toast.error('Failed to remove tag');
        return;
      }

      setTags(tags.filter(tag => tag.id !== tagId));
      toast.success('Tag removed successfully');
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFilterText('');
    }
  };

  // Function to get a consistent color for a tag based on its content
  const getTagColor = (tag: string) => {
    const index = tag.length % TAG_COLORS.length;
    return TAG_COLORS[index];
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
  };

  const clearFilter = () => {
    setFilterText('');
  };

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
            
            {/* Sort and Filter Controls */}
            <div className="flex items-center gap-1">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Sort Tags">
                    {sortOption.includes('a-z') ? 
                      <ArrowUpAZ className="h-3.5 w-3.5" /> :
                      <ArrowDownAZ className="h-3.5 w-3.5" />
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem 
                    className={cn("text-xs", sortOption === 'a-z' && "bg-accent")}
                    onClick={() => handleSortChange('a-z')}
                  >
                    <ArrowUpAZ className="mr-2 h-3.5 w-3.5" />
                    A to Z
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("text-xs", sortOption === 'z-a' && "bg-accent")}
                    onClick={() => handleSortChange('z-a')}
                  >
                    <ArrowDownAZ className="mr-2 h-3.5 w-3.5" />
                    Z to A
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("text-xs", sortOption === 'newest' && "bg-accent")}
                    onClick={() => handleSortChange('newest')}
                  >
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("text-xs", sortOption === 'oldest' && "bg-accent")}
                    onClick={() => handleSortChange('oldest')}
                  >
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Filter Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={handleFilterKeyDown}
              placeholder="Filter tags..."
              className="pl-8 pr-8 text-xs h-8"
            />
            {filterText && (
              <button 
                onClick={clearFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-muted-foreground/10 p-0.5"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 min-h-[40px] max-h-[120px] overflow-y-auto p-1 rounded-md border bg-background/50">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
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
                    onClick={() => removeTag(tag.id)} 
                    className="rounded-full hover:bg-white/30 p-0.5 transition-colors"
                    aria-label={`Remove tag ${tag.tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : filterText ? (
              <p className="text-xs text-muted-foreground italic px-1 w-full text-center py-2">No matching tags found</p>
            ) : (
              <p className="text-xs text-muted-foreground italic px-1 w-full text-center py-2">No tags added yet</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="text-xs h-8 pr-8"
              />
              <Button 
                size="sm" 
                className="absolute right-0 top-0 h-8 w-8 p-0 min-w-0" 
                onClick={addTag}
                disabled={!newTag.trim()}
                title="Add Tag"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
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
