
import React from 'react';
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
  
  const handleClose = () => {
    finalSetIsOpen(false);
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
