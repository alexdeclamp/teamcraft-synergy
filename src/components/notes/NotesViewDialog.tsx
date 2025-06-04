
import React from 'react';
import { Note } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNoteView from './view-dialog/MobileNoteView';
import DesktopNoteView from './view-dialog/DesktopNoteView';

interface NotesViewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
  onViewSimilar?: (note: Note) => void;
}

const NotesViewDialog: React.FC<NotesViewDialogProps> = ({
  isOpen,
  setIsOpen,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId,
  onViewSimilar
}) => {
  const isMobile = useIsMobile();

  if (!note) return null;
  
  if (isMobile) {
    return (
      <MobileNoteView
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDate}
        userId={userId}
        onViewSimilar={onViewSimilar}
      />
    );
  }

  return (
    <DesktopNoteView
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      note={note}
      onEdit={onEdit}
      onDelete={onDelete}
      formatDate={formatDate}
      userId={userId}
      onViewSimilar={onViewSimilar}
    />
  );
};

export default NotesViewDialog;
