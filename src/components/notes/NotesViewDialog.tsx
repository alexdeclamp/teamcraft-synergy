
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Note } from './types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText, Image, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotesFormatter from './NotesFormatter';
import { formatDistanceToNow } from 'date-fns';
import NoteSummaryButton from '@/components/NoteSummaryButton';
import { Dispatch, SetStateAction } from 'react';

interface NotesViewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
}

const NotesViewDialog: React.FC<NotesViewDialogProps> = ({
  isOpen,
  setIsOpen,
  onOpenChange,
  note,
  onEdit,
  onDelete,
  formatDate: propFormatDate,
  userId
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const finalSetIsOpen = onOpenChange || setIsOpen;

  if (!note) return null;
  
  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete(note.id);
      setIsOpen(false);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  const formatDateFn = (dateString: string) => {
    if (propFormatDate) return propFormatDate(dateString);
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={finalSetIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-0">
          {/* Mobile-optimized title with proper wrapping */}
          <DialogTitle className="text-xl break-words hyphens-auto pr-8">
            {note.title || "Untitled Note"}
          </DialogTitle>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
            <span>{formatDateFn(note.updated_at || note.created_at)}</span>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 mt-1 sm:mt-0">
                {note.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-4 mt-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(note)}
              className="h-8 text-xs"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Note
            </Button>
            
            <Button 
              variant={isConfirmingDelete ? "destructive" : "outline"} 
              size="sm" 
              onClick={handleDeleteClick}
              className="h-8 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {isConfirmingDelete ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
          
          <NoteSummaryButton 
            noteId={note.id}
            noteContent={note.content}
            noteName={note.title}
            projectId={note.project_id}
          />
        </div>
        
        {note.source_document && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
            <div className="flex items-center">
              {note.source_document.type === 'pdf' ? (
                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
              ) : (
                <Image className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
              <span className="text-muted-foreground ml-1 mr-1 flex-shrink-0">Source:</span>
              <span className="font-medium truncate">{note.source_document.name}</span>
            </div>
            <a 
              href={note.source_document.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline flex-shrink-0 mt-1 sm:mt-0 sm:ml-auto"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span>View Original</span>
            </a>
          </div>
        )}
        
        <div className="prose prose-sm sm:prose prose-slate max-w-none mt-4">
          <NotesFormatter content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesViewDialog;
