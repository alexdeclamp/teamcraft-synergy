
import { useState, useEffect } from 'react';
import { Note } from '@/components/notes/types';
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';

export function useNoteDialog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Ensure any body modifications are cleaned up when the component unmounts
  useEffect(() => {
    return () => {
      console.log('useNoteDialog unmount cleanup');
      forceFullDialogCleanup();
    };
  }, []);

  // Watch dialog state changes and clean up when all dialogs are closed
  useEffect(() => {
    if (!isCreateOpen && !isEditOpen && !isViewOpen) {
      console.log('All note dialogs closed, executing cleanup');
      forceFullDialogCleanup();
    }
  }, [isCreateOpen, isEditOpen, isViewOpen]);

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

  const resetDialogs = () => {
    // First reset the state
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    
    // Add a small delay before clearing the current note to prevent UI flickers
    setTimeout(() => {
      setCurrentNote(null);
    }, 100);
    
    // Force a complete cleanup
    forceFullDialogCleanup();
    
    console.log('All dialogs reset and cleaned up');
  };

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
