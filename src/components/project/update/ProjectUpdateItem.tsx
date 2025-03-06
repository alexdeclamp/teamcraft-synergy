
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { X, Tag, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Update } from './types';

interface ProjectUpdateItemProps {
  update: Update;
  isLast: boolean;
  userId?: string;
  onRemove: (updateId: string) => void;
}

const ProjectUpdateItem: React.FC<ProjectUpdateItemProps> = ({ 
  update, 
  isLast, 
  userId,
  onRemove 
}) => {
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = async (updateId: string) => {
    if (!tagInput.trim()) return;
    
    try {
      const currentTags = update.tags || [];
      const newTag = tagInput.trim();
      
      // Don't add duplicate tags
      if (currentTags.includes(newTag)) {
        toast.error('Tag already exists');
        return;
      }
      
      const updatedTags = [...currentTags, newTag];
      
      const { error } = await supabase
        .from('project_updates')
        .update({ tags: updatedTags })
        .eq('id', updateId);
      
      if (error) throw error;
      
      // Update the UI through parent component
      update.tags = updatedTags;
      
      // Reset input
      setTagInput('');
      setActiveUpdateId(null);
      toast.success('Tag added successfully');
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast.error(`Failed to add tag: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveTag = async (updateId: string, tagToRemove: string) => {
    try {
      const updatedTags = (update.tags || []).filter(tag => tag !== tagToRemove);
      
      const { error } = await supabase
        .from('project_updates')
        .update({ tags: updatedTags })
        .eq('id', updateId);
      
      if (error) throw error;
      
      // Update the UI through parent component
      update.tags = updatedTags;
      
      toast.success('Tag removed successfully');
    } catch (error: any) {
      console.error('Error removing tag:', error);
      toast.error(`Failed to remove tag: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          {update.user_avatar ? (
            <AvatarImage src={update.user_avatar} alt={update.user_name} />
          ) : (
            <AvatarFallback>
              {update.user_name?.charAt(0) || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1 flex-1">
          <div className="flex justify-between items-center">
            <p className="font-medium text-sm">{update.user_name}</p>
            <div className="flex gap-2 items-center">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
              </p>
              {userId === update.user_id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onRemove(update.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm whitespace-pre-line">{update.content}</p>
          
          {/* Tags section */}
          <div className="mt-2">
            <div className="flex flex-wrap gap-1 items-center">
              {(update.tags || []).map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="secondary" className="text-xs gap-1 py-0">
                  {tag}
                  {userId === update.user_id && (
                    <X 
                      className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                      onClick={() => handleRemoveTag(update.id, tag)}
                    />
                  )}
                </Badge>
              ))}
              
              {userId === update.user_id && activeUpdateId !== update.id && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 rounded-full"
                  onClick={() => setActiveUpdateId(update.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Tag input */}
            {activeUpdateId === update.id && (
              <div className="flex gap-2 mt-2 items-center">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="h-7 text-xs py-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(update.id);
                    } else if (e.key === 'Escape') {
                      setActiveUpdateId(null);
                      setTagInput('');
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="h-7 px-2 py-0"
                  onClick={() => handleAddTag(update.id)}
                >
                  Add
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 py-0"
                  onClick={() => {
                    setActiveUpdateId(null);
                    setTagInput('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isLast && <Separator className="my-4" />}
    </div>
  );
};

export default ProjectUpdateItem;
