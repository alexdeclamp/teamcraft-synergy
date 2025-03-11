
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/components/notes/types';

export function useNoteDelete(userId: string | undefined, notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, setAllTags: React.Dispatch<React.SetStateAction<string[]>>) {
  const handleDeleteNote = async (noteId: string) => {
    if (!noteId || !userId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
      
      const remainingTags = new Set<string>();
      notes
        .filter(note => note.id !== noteId)
        .forEach(note => {
          if (note.tags) {
            note.tags.forEach(tag => remainingTags.add(tag));
          }
        });
        
      setAllTags(Array.from(remainingTags));
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return {
    handleDeleteNote
  };
}
