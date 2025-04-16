
import { useMemo } from 'react';
import { Note } from '@/components/notes/types';

export function useNotesSearch(notes: Note[], searchQuery: string) {
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase().trim();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [notes, searchQuery]);

  return {
    filteredNotes
  };
}
