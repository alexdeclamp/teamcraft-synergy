
import React from 'react';
import { Note } from '@/components/notes/types';
import NotesViewDialog from '../NotesViewDialog';

interface NotesViewDialogContainerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  formatDate?: (dateString: string) => string;
  userId?: string;
}

export const NotesViewDialogContainer: React.FC<NotesViewDialogContainerProps> = ({
  isOpen,
  setIsOpen,
  note,
  onEdit,
  onDelete,
  formatDate,
  userId
}) => {
  return (
    <NotesViewDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      note={note}
      onEdit={onEdit}
      onDelete={onDelete}
      formatDate={formatDate}
      userId={userId}
    />
  );
};
