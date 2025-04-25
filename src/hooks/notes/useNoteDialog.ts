
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/components/notes/types';
import { resetBodyStyles, forceFullDialogCleanup } from '@/utils/dialogUtils';

export function useNoteDialog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Memoize cleanup functions to prevent unnecessary re-renders
  const cleanup = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.log('useNoteDialog unmount cleanup');
      forceFullDialogCleanup();
    }
  }, []);

  // Ensure any body modifications are cleaned up when the component unmounts
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Watch dialog state changes and clean up when all dialogs are closed
  useEffect(() => {
    if (!isCreateOpen && !isEditOpen && !isViewOpen) {
      console.log('All note dialogs closed, executing cleanup');
      forceFullDialogCleanup();
    }
  }, [isCreateOpen, isEditOpen, isViewOpen]);

  const openCreateDialog = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const openEditDialog = useCallback((note: Note) => {
    if (!note) {
      console.warn('Attempted to open edit dialog with null note');
      return;
    }
    
    setCurrentNote(note);
    setIsEditOpen(true);
  }, []);

  const openViewDialog = useCallback((note: Note) => {
    if (!note) {
      console.warn('Attempted to open view dialog with null note');
      return;
    }
    
    setCurrentNote(note);
    setIsViewOpen(true);
  }, []);

  const resetDialogs = useCallback(() => {
    // First reset the state
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    
    // Add a small delay before clearing the current note to prevent UI flickers
    const timer = setTimeout(() => {
      setCurrentNote(null);
    }, 100);
    
    // Force a complete cleanup
    forceFullDialogCleanup();
    
    console.log('All dialogs reset and cleaned up');
    
    // Return a cleanup function to clear the timeout
    return () => clearTimeout(timer);
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
