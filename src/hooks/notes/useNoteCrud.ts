
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/components/notes/types';
import { useNoteEmbeddings } from './useNoteEmbeddings';

export function useNoteCrud(
  projectId: string,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  allTags: string[],
  setAllTags: React.Dispatch<React.SetStateAction<string[]>>
) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const { generateEmbedding } = useNoteEmbeddings();

  const handleCreateNote = async (title: string, content: string, tags: string[]) => {
    if (!title.trim() || !projectId || !user) {
      toast.error('Please enter a title for your note');
      return false;
    }
    
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title,
          content,
          project_id: projectId,
          user_id: user.id,
          tags: tags.length > 0 ? tags : null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newNote: Note = {
        ...data,
        creator_name: user.user_metadata?.full_name || 'Unknown User',
        creator_avatar: user.user_metadata?.avatar_url,
        source_document: data.source_document ? {
          type: (data.source_document as any).type,
          url: (data.source_document as any).url,
          name: (data.source_document as any).name
        } : null
      };
      
      setNotes([newNote, ...notes]);
      toast.success('Note created successfully');
      
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
      
      // Generate embedding for the new note
      const embedText = `${title} ${content || ''}`.trim();
      if (embedText) {
        generateEmbedding(data.id, embedText);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = async (noteId: string, title: string, content: string, tags: string[], currentNote: Note) => {
    if (!title.trim() || !noteId || !user) {
      toast.error('Please enter a title for your note');
      return false;
    }
    
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
          tags: tags.length > 0 ? tags : null
        })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedNote: Note = {
        ...data,
        creator_name: currentNote.creator_name,
        creator_avatar: currentNote.creator_avatar,
        source_document: data.source_document ? {
          type: (data.source_document as any).type,
          url: (data.source_document as any).url,
          name: (data.source_document as any).name
        } : null
      };
      
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      toast.success('Note updated successfully');
      
      const newTags = tags.filter(tag => !allTags.includes(tag));
      if (newTags.length > 0) {
        setAllTags([...allTags, ...newTags]);
      }
      
      // Update embedding for the edited note
      const embedText = `${title} ${content || ''}`.trim();
      if (embedText) {
        generateEmbedding(noteId, embedText);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleCreateNote,
    handleEditNote
  };
}
