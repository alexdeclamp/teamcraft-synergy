
import React, { useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Tag as TagIcon,
  ClipboardCopy,
  FilePlus,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NoteSummaryButton from '@/components/NoteSummaryButton';
import RegenerateMetadataButton from '@/components/note/RegenerateMetadataButton';
import TagInput from '@/components/tags/TagInput';

interface ProjectNoteCardProps {
  note: any;
  onDelete: (id: string) => void;
  onUpdate: () => void;
  projectId: string;
  showSummaryButton?: boolean;
  showRegenerateButton?: boolean;
  isSelectionMode?: boolean;
}

const ProjectNoteCard: React.FC<ProjectNoteCardProps> = ({
  note,
  onDelete,
  onUpdate,
  projectId,
  showSummaryButton = false,
  showRegenerateButton = false,
  isSelectionMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title || '');
  const [editContent, setEditContent] = useState(note.content || '');
  const [editTags, setEditTags] = useState<string[]>(note.tags || []);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleEdit = () => {
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditTags(note.tags || []);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      toast.error('Note title cannot be empty');
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('project_notes')
        .update({
          title: editTitle,
          content: editContent,
          tags: editTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);
      
      if (error) throw error;
      
      toast.success('Note updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content || '');
    toast.success('Note content copied to clipboard');
  };
  
  const handleCreateNewNote = () => {
    // Implement creating a new note based on this one
    // This could open a modal or redirect to a new note page with prefilled content
    toast.info('Create new note based on this one (Not implemented)');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 border ${isEditing ? 'ring-2 ring-primary/50' : 'hover:border-primary/20'}`}>
      {isEditing ? (
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="note-title" className="block text-sm font-medium mb-1">Title</label>
              <Input
                id="note-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="note-content" className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                id="note-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] resize-y"
              />
            </div>
            
            <div>
              <label htmlFor="note-tags" className="block text-sm font-medium mb-1">Tags</label>
              <TagInput
                tags={editTags}
                setTags={setEditTags}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>Updating...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium line-clamp-2">
                {note.title}
              </CardTitle>
              
              {!isSelectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Note Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyContent}>
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copy Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateNewNote}>
                      <FilePlus className="h-4 w-4 mr-2" />
                      Use as Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => onDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            <div className="text-sm text-muted-foreground mb-2">
              {formatDate(note.created_at)}
              {note.created_at !== note.updated_at && 
                ` (Updated ${formatDate(note.updated_at)})`}
            </div>
            
            <div className="whitespace-pre-line text-sm">
              {note.content?.length > 300 
                ? `${note.content?.substring(0, 300)}...` 
                : note.content || 'No content'}
            </div>
          </CardContent>
          
          {(note.tags?.length > 0 || showSummaryButton || showRegenerateButton) && (
            <CardFooter className="p-4 pt-0 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-1">
                {note.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 ml-auto">
                {showRegenerateButton && (
                  <RegenerateMetadataButton noteId={note.id} onSuccess={onUpdate} />
                )}
                
                {showSummaryButton && (
                  <NoteSummaryButton
                    noteId={note.id}
                    content={note.content}
                    title={note.title}
                  />
                )}
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
};

export default ProjectNoteCard;
