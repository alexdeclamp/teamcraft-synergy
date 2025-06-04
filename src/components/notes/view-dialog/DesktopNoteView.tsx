import React, { useEffect } from 'react';
import { Note } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import NoteInfo from './NoteInfo';
import NoteActions from './NoteActions';
import NoteSourceDocument from './NoteSourceDocument';
import NotesFormatter from '../NotesFormatter';
import { resetBodyStyles, initializeDialogState } from '@/utils/dialogUtils';

interface DesktopNoteViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
  onViewSimilar?: (note: Note) => void;
  onClose?: () => void;
}

const DesktopNoteView: React.FC<DesktopNoteViewProps> = ({
  isOpen,
  setIsOpen,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId,
  onViewSimilar,
  onClose
}) => {
  // Initialize dialog state when component mounts
  useEffect(() => {
    let isMounted = true;
    
    if (isOpen) {
      (async () => {
        await initializeDialogState();
        if (isMounted) {
          console.log('Desktop view dialog initialized');
        }
      })();
    }
    
    // Enhanced cleanup on unmount
    return () => {
      isMounted = false;
      console.log('Desktop view unmounting, cleaning up');
      resetBodyStyles();
    };
  }, [isOpen]);

  // Enhanced open change handler with delayed cleanup
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (onClose) {
        onClose();
      } else {
        setIsOpen(false);
        // Add significant delay before cleanup
        setTimeout(() => {
          resetBodyStyles();
          console.log('Desktop view dialog cleanup after close');
        }, 500);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[900px] min-h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl break-words hyphens-auto pr-8">
            {note.title || "Untitled Note"}
          </DialogTitle>
          
          <DialogDescription className="sr-only">
            View note details and content
          </DialogDescription>
          
          <NoteInfo 
            updatedAt={note.updated_at}
            createdAt={note.created_at}
            tags={note.tags}
            formatDate={formatDate}
          />
        </DialogHeader>
        
        <div className="flex-shrink-0 p-6 pb-4 border-b">
          <NoteActions
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            isMobile={false}
          />
          
          <NoteSourceDocument sourceDocument={note.source_document} />
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6">
          <div className="prose prose-sm sm:prose prose-slate max-w-none text-xs sm:text-sm break-words hyphens-auto">
            <NotesFormatter content={note.content} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopNoteView;
