import React, { useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Note } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNoteView from './view-dialog/MobileNoteView';
import DesktopNoteView from './view-dialog/DesktopNoteView';
import { resetBodyStyles, initializeDialogState } from '@/utils/dialogUtils';

interface NotesViewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
  onViewSimilar?: (note: Note) => void;
  onClose?: () => void;
}

const NotesViewDialog: React.FC<NotesViewDialogProps> = ({
  isOpen,
  setIsOpen,
  onOpenChange,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId,
  onViewSimilar,
  onClose
}) => {
  const finalSetIsOpen = onOpenChange || setIsOpen;
  const isMobile = useIsMobile();

  // Init dialog state when it first opens to prevent flash close
  useEffect(() => {
    let isMounted = true;
    
    // Initialize dialog state when opening
    if (isOpen && note) {
      // This prevents the flash open/close issue
      (async () => {
        await initializeDialogState();
        if (isMounted) {
          console.log('Note dialog fully initialized');
        }
      })();
    }
    
    // Enhanced cleanup when component unmounts or dialog state changes
    if (!isOpen) {
      // Add significant delay to ensure dialog animation completes before cleanup
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          resetBodyStyles();
          console.log('Note dialog cleanup after closing');
        }
      }, 500); // Increased from 300ms to 500ms for more reliability
      
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, note]);
  
  // Safe close handler that ensures cleanup with proper timing
  const handleClose = () => {
    finalSetIsOpen(false);
    // Allow dialog to start closing animation before cleanup
    setTimeout(() => {
      resetBodyStyles();
      console.log('Note dialog manual close cleanup');
    }, 500); // Increased from 300ms to 500ms for more reliability
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
        onViewSimilar={onViewSimilar}
        onClose={onClose || handleClose}
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
      onViewSimilar={onViewSimilar}
      onClose={onClose || handleClose}
    />
  );
};

export default NotesViewDialog;
