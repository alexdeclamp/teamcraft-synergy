
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NoteWithProject } from './types';

export function useVectorNotes(projectId?: string) {
  const [notes, setNotes] = useState<NoteWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('project_notes')
        .select(`
          id,
          title,
          content,
          embedding,
          created_at,
          updated_at,
          project_id,
          user_id,
          projects!inner(title)
        `)
        .order('updated_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Note type with projects info
      const transformedNotes: NoteWithProject[] = (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        embedding: note.embedding,
        created_at: note.created_at,
        updated_at: note.updated_at,
        project_id: note.project_id,
        user_id: note.user_id,
        projects: note.projects
      }));

      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    notes,
    loading,
    fetchNotes
  };
}
