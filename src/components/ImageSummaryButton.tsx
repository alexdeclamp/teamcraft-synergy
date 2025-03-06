import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ImageTag {
  id: string;
  tag: string;
}

interface ImageSummaryButtonProps {
  imageUrl: string;
  projectId: string;
  imageName?: string;
}

const ImageSummaryButton: React.FC<ImageSummaryButtonProps> = ({
  imageUrl,
  projectId,
  imageName
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  const [tags, setTags] = useState<ImageTag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const { user } = useAuth();
  const params = useParams<{ projectId?: string; id?: string }>();

  useEffect(() => {
    console.log('Current params:', params);
    console.log('Project ID from params:', projectId);
    console.log('Image URL:', imageUrl);
  }, [params, projectId, imageUrl]);

  useEffect(() => {
    if (imageUrl && projectId) {
      fetchExistingSummary();
      fetchImageTags();
    } else {
      console.error('Missing required data to fetch summary:', { imageUrl, projectId });
    }
  }, [imageUrl, projectId]);

  const fetchExistingSummary = async () => {
    try {
      console.log('Fetching existing summary for image:', imageUrl);
      console.log('Project ID:', projectId);
      
      const { data, error } = await supabase
        .from('image_summaries')
        .select('summary')
        .eq('image_url', imageUrl)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching summary:', error);
        return;
      }

      console.log('Summary data:', data);

      if (data && data.summary) {
        setSummary(data.summary);
        setHasSummary(true);
      }
    } catch (error) {
      console.error('Error checking for existing summary:', error);
    }
  };

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

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      
      if (hasSummary) {
        return;
      }
      
      console.log('Generating summary for image:', imageUrl);
      console.log('For project:', projectId);
      
      if (!projectId) {
        throw new Error('Project ID is missing, cannot generate summary');
      }
      
      const response = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'image',
          imageUrl: imageUrl,
          userId: user?.id,
          projectId: projectId
        },
      });

      console.log('Response from edge function:', response);
      
      if (response.error) {
        console.error('Error from edge function:', response.error);
        throw new Error(`Error from edge function: ${response.error.message || response.error}`);
      }
      
      const data = response.data;
      console.log('Data from edge function:', data);
      
      if (!data) {
        throw new Error('No data received from edge function');
      }
      
      if (data.error) {
        throw new Error(`Error from OpenAI: ${data.error}`);
      }
      
      if (!data.summary) {
        console.error('Invalid response data structure:', data);
        throw new Error('Failed to get a valid summary from the edge function');
      }
      
      console.log('Received summary data:', data);
      setSummary(data.summary);
      setHasSummary(true);
      toast.success('Summary generated and saved successfully');
      
      await fetchExistingSummary();
      
    } catch (error: any) {
      console.error('Error generating image summary:', error);
      setSummary(`Error: ${error.message}`);
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleButtonClick = () => {
    if (!projectId) {
      toast.error('Project ID is missing. Please reload the page or navigate to the project again.');
      return;
    }

    setIsDialogOpen(true);
    if (!hasSummary) {
      generateSummary();
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
    <>
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-7 w-7 ${hasSummary ? 'text-green-500' : ''}`}
          onClick={handleButtonClick}
          disabled={isGenerating || !projectId}
          title={hasSummary ? "View AI Summary" : "Generate AI Summary"}
        >
          {isGenerating ? 
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
            <MessageSquare className="h-3.5 w-3.5" />
          }
        </Button>

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
      </div>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Description of "${imageName}"`}
        summary={summary}
        isLoading={isGenerating}
      />
    </>
  );
};

export default ImageSummaryButton;
