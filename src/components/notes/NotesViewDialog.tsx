
import React, { useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Note } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNoteView from './view-dialog/MobileNoteView';
import DesktopNoteView from './view-dialog/DesktopNoteView';

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
  formatDate,
  userId
}) => {
  const finalSetIsOpen = onOpenChange || setIsOpen;
  const isMobile = useIsMobile();

  // Clean up any body/document level side effects when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Remove any stuck event listeners or body classes
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    };
  }, [isOpen]);

  if (!note) return null;
  
  if (isMobile) {
    return (
      <MobileNoteView
        isOpen={isOpen}
        setIsOpen={finalSetIsOpen}
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDate}
        userId={userId}
      />
    );
  }

  return (
    <DesktopNoteView
      isOpen={isOpen}
      setIsOpen={finalSetIsOpen}
      note={note}
      onEdit={onEdit}
      onDelete={onDelete}
      formatDate={formatDate}
      userId={userId}
    />
  );
};

export default NotesViewDialog;
