
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Note } from './types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileText, Image, ExternalLink, PenSquare } from 'lucide-react';
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
          <div className="pt-6 mb-6">
            <SheetHeader className="mb-3">
              <SheetTitle className="text-lg sm:text-xl break-words hyphens-auto pr-8 text-left">
                {note.title || "Untitled Note"}
              </SheetTitle>
            </SheetHeader>
          </div>
          
          {/* Metadata section - tags and date */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
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
          
          {/* Action buttons organized in two rows */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(note)}
              className="h-8 text-xs flex justify-center items-center"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            
            <Button 
              variant={isConfirmingDelete ? "destructive" : "outline"} 
              size="sm" 
              onClick={handleDeleteClick}
              className="h-8 text-xs flex justify-center items-center"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {isConfirmingDelete ? "Confirm" : "Delete"}
            </Button>
            
            <Button 
              variant="default"
              size="sm"
              className="col-span-2 h-9 mt-1 text-sm"
              onClick={() => {
                const summaryBtn = document.querySelector('[title*="Generate AI Summary"], [title*="View Saved AI Summary"]') as HTMLButtonElement;
                if (summaryBtn) summaryBtn.click();
              }}
            >
              <PenSquare className="h-4 w-4 mr-1.5" />
              Generate AI Summary
            </Button>
            
            {/* Hidden button for functionality */}
            <div className="hidden">
              <NoteSummaryButton 
                noteId={note.id}
                noteContent={note.content}
                noteName={note.title}
                projectId={note.project_id}
              />
            </div>
          </div>
          
          {/* Source document info if exists */}
          {note.source_document && (
            <div className="mb-4 p-3 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
              <div className="flex items-center overflow-hidden mb-1">
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
          
          {/* Content */}
          <div className="prose prose-sm max-w-none mt-2 text-sm overflow-hidden overflow-wrap-anywhere break-words hyphens-auto pb-10" style={{wordBreak: 'break-word'}}>
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
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg sm:text-xl break-words hyphens-auto pr-8">
            {note.title || "Untitled Note"}
          </DialogTitle>
          
          {/* Metadata section - date and tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
            <span>{formatDateFn(note.updated_at || note.created_at)}</span>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 mt-1 sm:mt-0 sm:ml-2">
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
        
        {/* Action buttons in a single organized row for desktop */}
        <div className="flex items-center gap-2 mb-4">
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
          
          <div className="ml-auto">
            <NoteSummaryButton 
              noteId={note.id}
              noteContent={note.content}
              noteName={note.title}
              projectId={note.project_id}
            />
          </div>
        </div>
        
        {/* Source document info if exists */}
        {note.source_document && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/40 rounded-md text-sm border border-muted-foreground/20">
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
        
        {/* Content */}
        <div className="prose prose-sm sm:prose prose-slate max-w-none mt-2 text-sm sm:text-base overflow-x-hidden break-words hyphens-auto">
          <NotesFormatter content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesViewDialog;
