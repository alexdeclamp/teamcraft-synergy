
import React, { useEffect } from 'react';
import { Note } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NoteInfo from './NoteInfo';
import NoteActions from './NoteActions';
import NoteSourceDocument from './NoteSourceDocument';
import NotesFormatter from '../NotesFormatter';

interface DesktopNoteViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
}

const DesktopNoteView: React.FC<DesktopNoteViewProps> = ({
  isOpen,
  setIsOpen,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId
}) => {
  // Ensure we clean up everything when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Make sure to fully close the dialog
      setIsOpen(false);
      
      // Reset body styles that might be causing issues
      document.body.style.overflow = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl sm:text-2xl break-words hyphens-auto pr-8">
            {note.title || "Untitled Note"}
          </DialogTitle>
          
          <NoteInfo 
            updatedAt={note.updated_at}
            createdAt={note.created_at}
            tags={note.tags}
            formatDate={formatDate}
          />
        </DialogHeader>
        
        <NoteActions
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          isMobile={false}
        />
        
        <NoteSourceDocument sourceDocument={note.source_document} />
        
        <div className="prose prose-sm sm:prose prose-slate max-w-none mt-2 text-xs sm:text-sm overflow-x-hidden break-words hyphens-auto">
          <NotesFormatter content={note.content} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopNoteView;
