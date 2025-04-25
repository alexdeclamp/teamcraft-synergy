
import React, { useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Note } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNoteView from './view-dialog/MobileNoteView';
import DesktopNoteView from './view-dialog/DesktopNoteView';
import { resetBodyStyles } from '@/utils/dialogUtils';

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

  // Enhanced cleanup when component unmounts or dialog state changes
  useEffect(() => {
    // Only run cleanup when dialog actually closes after being open
    // This prevents the premature cleanup that was causing the flash-close issue
    if (!isOpen) {
      // Add small delay to ensure dialog animation completes before cleanup
      const timeoutId = setTimeout(() => {
        resetBodyStyles();
      }, 150); // Increased from 100ms to 150ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);
  
  // Safe close handler that ensures cleanup with proper timing
  const handleClose = () => {
    finalSetIsOpen(false);
    // Allow dialog to start closing animation before cleanup
    setTimeout(() => {
      resetBodyStyles();
    }, 150); // Increased from 100ms to 150ms
  };

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
        onClose={handleClose}
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
      onClose={handleClose}
    />
  );
};

export default NotesViewDialog;
