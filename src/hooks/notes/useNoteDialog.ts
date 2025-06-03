
import { useEffect } from 'react';
import { forceFullDialogCleanup } from '@/utils/dialogUtils';
import { useNotesDialogState } from './useNotesDialogState';
import { useNotesCurrentNote } from './useNotesCurrentNote';
import { useNotesDialogActions } from './useNotesDialogActions';
import { useNotesDialogReset } from './useNotesDialogReset';

export function useNoteDialog() {
  const {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen
  } = useNotesDialogState();

  const {
    currentNote,
    setCurrentNote,
    clearCurrentNote
  } = useNotesCurrentNote();

  const {
    openCreateDialog,
    openEditDialog,
    openViewDialog
  } = useNotesDialogActions({
    setIsCreateOpen,
    setIsEditOpen,
    setIsViewOpen,
    setCurrentNote
  });

  const { resetDialogs } = useNotesDialogReset({
    setIsCreateOpen,
    setIsEditOpen,
    setIsViewOpen,
    clearCurrentNote
  });

  // Ensure any body modifications are cleaned up when the component unmounts
  useEffect(() => {
    return () => {
      console.log('useNoteDialog unmount cleanup');
      forceFullDialogCleanup();
    };
  }, []);

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen,
    currentNote,
    setCurrentNote,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    resetDialogs
  };
}
