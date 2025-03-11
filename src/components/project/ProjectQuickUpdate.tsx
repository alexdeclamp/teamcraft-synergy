
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SendHorizontal, Loader2, Tag, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectQuickUpdateProps {
  projectId: string;
  onUpdateAdded?: () => void;
}

const ProjectQuickUpdate: React.FC<ProjectQuickUpdateProps> = ({ projectId, onUpdateAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: content.trim(),
          tags: tags.length > 0 ? tags : null
        });
      
      if (error) throw error;
      
      toast.success('Update posted successfully');
      setContent('');
      setTags([]);
      setTagInput('');
      setShowTagInput(false);
      
      if (onUpdateAdded) {
        onUpdateAdded();
      }
    } catch (error: any) {
      console.error('Error posting update:', error);
      toast.error(`Failed to post update: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (tags.includes(tagInput.trim())) {
      toast.error('Tag already exists');
      return;
    }
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setTagInput('');
      if (!tags.length) {
        setShowTagInput(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-card rounded-lg p-4 border">
      <Textarea
        placeholder="Share a quick project update with your team..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none focus-visible:ring-primary"
        disabled={isSubmitting}
      />
      
      {/* Tags section */}
      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
          
          {!showTagInput && (
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              className="h-6 text-xs flex items-center gap-1.5 px-2 py-1"
              onClick={() => setShowTagInput(true)}
            >
              <Tag className="h-3 w-3" />
              <span>Add Tags</span>
            </Button>
          )}
        </div>
        
        {showTagInput && (
          <div className="flex gap-2 mb-3 items-center">
            <div className="relative flex-grow">
              <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="h-8 text-xs pl-8"
                onKeyDown={handleTagInputKeyDown}
                autoFocus
              />
            </div>
            <Button 
              type="button"
              size="sm" 
              variant="outline"
              className="h-8 px-3"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground italic">
          {tags.length > 0 && `${tags.length} tag${tags.length > 1 ? 's' : ''} added`}
        </div>
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="flex gap-2 items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <SendHorizontal className="h-4 w-4" />
              Post Update
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectQuickUpdate;
