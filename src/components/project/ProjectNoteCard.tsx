
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ToggleStatusButton from './common/ToggleStatusButton';
import NoteSummaryButton from '@/components/NoteSummaryButton';

interface ProjectNoteCardProps {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  updatedAt: string;
  tags?: string[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isFavorite?: boolean;
  isArchived?: boolean;
  isImportant?: boolean;
  onStatusChange?: () => void;
}

const ProjectNoteCard: React.FC<ProjectNoteCardProps> = ({
  id,
  projectId,
  title,
  content,
  updatedAt,
  tags = [],
  onDelete,
  onEdit,
  isFavorite = false,
  isArchived = false,
  isImportant = false,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const cardOpacity = isArchived ? 'opacity-60' : 'opacity-100';
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  const toggleFavorite = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('project_notes')
        .update({ 
          is_favorite: !isFavorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(
        !isFavorite
          ? 'Note added to favorites'
          : 'Note removed from favorites'
      );
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleArchive = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('project_notes')
        .update({ 
          is_archived: !isArchived,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(
        !isArchived
          ? 'Note archived'
          : 'Note restored from archive'
      );
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling archive:', error);
      toast.error('Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const toggleImportant = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('project_notes')
        .update({ 
          is_important: !isImportant,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(
        !isImportant
          ? 'Note marked as important'
          : 'Note unmarked as important'
      );
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error('Error toggling important:', error);
      toast.error('Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const previewContent = content && content.length > 100
    ? content.substring(0, 100) + '...'
    : content;

  return (
    <Card 
      className={`cursor-pointer hover:border-primary/50 transition-all ${cardOpacity}`}
      onClick={() => onEdit(id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex space-x-1">
            <ToggleStatusButton 
              status="important"
              isActive={isImportant}
              onClick={toggleImportant}
              size="xs"
              disabled={isUpdating}
            />
            <ToggleStatusButton 
              status="favorite"
              isActive={isFavorite}
              onClick={toggleFavorite}
              size="xs"
              disabled={isUpdating}
            />
            <ToggleStatusButton 
              status="archive"
              isActive={isArchived}
              onClick={toggleArchive}
              size="xs"
              disabled={isUpdating}
            />
            <NoteSummaryButton 
              noteId={id}
              noteTitle={title}
              noteContent={content}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {updatedAt && format(new Date(updatedAt), 'MMM d, yyyy')}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
          {previewContent || 'No content'}
        </p>
      </CardContent>
      {tags.length > 0 && (
        <CardFooter className="flex flex-wrap pt-0 gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      )}
      <CardFooter className="pt-2 justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={handleEdit}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectNoteCard;
