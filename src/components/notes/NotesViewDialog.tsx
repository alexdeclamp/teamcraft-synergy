
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const isMobile = useIsMobile();

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
  
  // Use Sheet component for mobile view
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={finalSetIsOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-4 overflow-y-auto overflow-x-hidden">
          <SheetHeader className="space-y-0">
            <SheetTitle className="text-lg break-words hyphens-auto pr-8">
              {note.title || "Untitled Note"}
            </SheetTitle>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>{formatDateFn(note.updated_at || note.created_at)}</span>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1 mt-1">
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
          </SheetHeader>
          
          <div className="flex flex-col gap-3 mb-4 mt-4">
            <div className="flex w-full justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(note)}
                className="h-8 text-xs"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              
              <Button 
                variant={isConfirmingDelete ? "destructive" : "outline"} 
                size="sm" 
                onClick={handleDeleteClick}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {isConfirmingDelete ? "Confirm" : "Delete"}
              </Button>
            </div>
            
            <div className="flex justify-center mt-1">
              <NoteSummaryButton 
                noteId={note.id}
                noteContent={note.content}
                noteName={note.title}
                projectId={note.project_id}
              />
            </div>
          </div>
          
          {note.source_document && (
            <div className="mb-4 flex flex-col gap-2 p-2 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
              <div className="flex items-center overflow-hidden">
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
                className="flex items-center text-primary hover:underline flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                <span>View</span>
              </a>
            </div>
          )}
          
          <div className="prose prose-sm max-w-none mt-4 text-sm overflow-hidden overflow-wrap-anywhere break-words hyphens-auto pb-10" style={{wordBreak: 'break-word'}}>
            <NotesFormatter content={note.content} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view using Dialog
  return (
    <Dialog open={isOpen} onOpenChange={finalSetIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-lg sm:text-xl break-words hyphens-auto pr-8">
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
              Edit
            </Button>
            
            <Button 
              variant={isConfirmingDelete ? "destructive" : "outline"} 
              size="sm" 
              onClick={handleDeleteClick}
              className="h-8 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {isConfirmingDelete ? "Confirm" : "Delete"}
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
            <div className="flex items-center flex-grow overflow-hidden">
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
              <span>View</span>
            </a>
          </div>
        )}
        
        <div className="prose prose-sm sm:prose prose-slate max-w-none mt-4 text-sm sm:text-base overflow-x-hidden break-words hyphens-auto">
          <NotesFormatter content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesViewDialog;
