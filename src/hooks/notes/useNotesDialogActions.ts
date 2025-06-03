
import { Note } from '@/components/notes/types';

interface UseNotesDialogActionsProps {
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsViewOpen: (open: boolean) => void;
  setCurrentNote: (note: Note | null) => void;
}

export function useNotesDialogActions({
  setIsCreateOpen,
  setIsEditOpen,
  setIsViewOpen,
  setCurrentNote
}: UseNotesDialogActionsProps) {
  const openCreateDialog = () => {
    setIsCreateOpen(true);
  };

  const openEditDialog = (note: Note) => {
    setCurrentNote(note);
    setIsEditOpen(true);
  };

  const openViewDialog = (note: Note) => {
    setCurrentNote(note);
    setIsViewOpen(true);
  };

  return {
    openCreateDialog,
    openEditDialog,
    openViewDialog
  };
}
