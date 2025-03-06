
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ImageTag {
  id: string;
  tag: string;
}

interface ImageTagManagerProps {
  imageUrl: string;
  projectId: string | undefined;
}

const ImageTagManager: React.FC<ImageTagManagerProps> = ({ imageUrl, projectId }) => {
  const [tags, setTags] = useState<ImageTag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (imageUrl && projectId) {
      fetchImageTags();
    }
  }, [imageUrl, projectId]);

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

  return (
    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          title="Manage Tags"
        >
          <Tag className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="top">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Image Tags</h3>
          
          <div className="flex flex-wrap gap-1 min-h-[40px]">
            {tags.length > 0 ? (
              tags.map(tag => (
                <Badge key={tag.id} className="flex items-center gap-1 text-xs">
                  {tag.tag}
                  <button 
                    onClick={() => removeTag(tag.id)} 
                    className="text-xs hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No tags added yet</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag..."
              className="text-xs h-7"
            />
            <Button size="sm" className="h-7 text-xs px-2" onClick={addTag}>
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImageTagManager;
