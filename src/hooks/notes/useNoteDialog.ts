
import { useState } from 'react';
import { Note } from '@/components/notes/types';

export function useNoteDialog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

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
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setCurrentNote(null);
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
