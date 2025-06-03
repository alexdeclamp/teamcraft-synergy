
import { useState } from 'react';
import { Note } from '@/components/notes/types';

export function useNotesCurrentNote() {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const clearCurrentNote = () => {
    // Add a small delay before clearing the current note to prevent UI flickers
    setTimeout(() => {
      setCurrentNote(null);
    }, 100);
  };

  return {
    currentNote,
    setCurrentNote,
    clearCurrentNote
  };
}
