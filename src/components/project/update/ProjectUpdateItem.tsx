
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
import ToggleStatusButton from '../common/ToggleStatusButton';

interface ProjectUpdateItemProps {
  update: Update;
  isLast: boolean;
  userId?: string;
  onRemove: (updateId: string) => void;
  onStatusChange?: () => void;
}

const ProjectUpdateItem: React.FC<ProjectUpdateItemProps> = ({ 
  update, 
  isLast, 
  userId,
  onRemove,
  onStatusChange
}) => {
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const toggleFavorite = async () => {
    try {
      setIsUpdating(true);
      
      const newValue = !update.is_favorite;
      
      const { error } = await supabase
        .from('project_updates')
        .update({ is_favorite: newValue })
        .eq('id', update.id);
      
      if (error) throw error;
      
      // Update UI
      update.is_favorite = newValue;
      
      toast.success(newValue ? 'Update added to favorites' : 'Update removed from favorites');
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleArchive = async () => {
    try {
      setIsUpdating(true);
      
      const newValue = !update.is_archived;
      
      const { error } = await supabase
        .from('project_updates')
        .update({ is_archived: newValue })
        .eq('id', update.id);
      
      if (error) throw error;
      
      // Update UI
      update.is_archived = newValue;
      
      toast.success(newValue ? 'Update archived' : 'Update restored from archive');
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling archive:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleImportant = async () => {
    try {
      setIsUpdating(true);
      
      const newValue = !update.is_important;
      
      const { error } = await supabase
        .from('project_updates')
        .update({ is_important: newValue })
        .eq('id', update.id);
      
      if (error) throw error;
      
      // Update UI
      update.is_important = newValue;
      
      toast.success(newValue ? 'Update marked as important' : 'Update unmarked as important');
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling important:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-card rounded-lg p-4 border ${update.is_archived ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          {update.user_avatar ? (
            <AvatarImage src={update.user_avatar} alt={update.user_name} />
          ) : (
            <AvatarFallback>
              {update.user_name?.charAt(0) || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-center">
            <p className="font-medium">{update.user_name}</p>
            <div className="flex gap-2 items-center">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
              </p>
              
              {/* Status buttons */}
              {userId === update.user_id && (
                <div className="flex space-x-1">
                  <ToggleStatusButton 
                    status="important"
                    isActive={!!update.is_important}
                    onClick={toggleImportant}
                    size="xs"
                    disabled={isUpdating}
                  />
                  <ToggleStatusButton 
                    status="favorite"
                    isActive={!!update.is_favorite}
                    onClick={toggleFavorite}
                    size="xs"
                    disabled={isUpdating}
                  />
                  <ToggleStatusButton 
                    status="archive"
                    isActive={!!update.is_archived}
                    onClick={toggleArchive}
                    size="xs"
                    disabled={isUpdating}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => onRemove(update.id)}
                    title="Delete update"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm whitespace-pre-line">{update.content}</p>
          
          {/* Tags section */}
          <div className="mt-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              {(update.tags || []).map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
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
                  title="Add tag"
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
    </div>
  );
};

export default ProjectUpdateItem;
