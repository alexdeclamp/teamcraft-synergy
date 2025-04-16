
import { useState, useEffect } from 'react';
import { Note } from '@/components/notes/types';

export function useNoteDialog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Ensure any body modifications are cleaned up when the component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open', 'sheet-open');
    };
  }, []);

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
    
    // Make sure to reset body styles
    document.body.style.overflow = '';
    document.body.classList.remove('dialog-open', 'sheet-open');
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
