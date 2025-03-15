
import React from 'react';
import { Note } from '../types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import NoteInfo from './NoteInfo';
import NoteActions from './NoteActions';
import NoteSourceDocument from './NoteSourceDocument';
import NotesFormatter from '../NotesFormatter';

interface MobileNoteViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
}

const MobileNoteView: React.FC<MobileNoteViewProps> = ({
  isOpen,
  setIsOpen,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="bottom" className="h-[90vh] p-4 overflow-y-auto overflow-x-hidden">
        <div className="pt-6 mb-6">
          <SheetHeader className="mb-3">
            <SheetTitle className="text-lg sm:text-xl break-words hyphens-auto pr-8 text-left">
              {note.title || "Untitled Note"}
            </SheetTitle>
          </SheetHeader>
        </div>
        
        <NoteInfo 
          updatedAt={note.updated_at}
          createdAt={note.created_at}
          tags={note.tags}
          formatDate={formatDate}
        />
        
        <NoteActions
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          isMobile={true}
        />
        
        <NoteSourceDocument sourceDocument={note.source_document} />
        
        <div className="prose prose-sm max-w-none mt-2 text-xs overflow-hidden overflow-wrap-anywhere break-words hyphens-auto pb-10" style={{wordBreak: 'break-word'}}>
          <NotesFormatter content={note.content} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNoteView;
