
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/components/notes/types';

export function useFetchNotes(projectId: string, userId: string | undefined, activeTag: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!projectId || !userId) return;
    try {
      setLoading(true);
      let query = supabase.from('project_notes').select('*').eq('project_id', projectId);
      if (activeTag) {
        query = query.contains('tags', [activeTag]);
      }
      const { data: notesData, error: notesError } = await query.order('updated_at', {
        ascending: false
      });
      
      if (notesError) throw notesError;
      
      const userIds = [...new Set(notesData?.map(note => note.user_id) || [])];
      const tagSet = new Set<string>();
      
      notesData?.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => tagSet.add(tag));
        }
      });
      
      setAllTags(Array.from(tagSet));
      
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }
      
      const notesWithCreators: Note[] = (notesData || []).map(note => {
        const creator = profiles.find(profile => profile.id === note.user_id);
        
        let typedSourceDocument = null;
        if (note.source_document) {
          const docData = note.source_document as any;
          if (docData && docData.type && docData.url && docData.name) {
            typedSourceDocument = {
              type: docData.type as 'pdf' | 'image',
              url: docData.url as string,
              name: docData.name as string
            };
          }
        }
        
        return {
          ...note,
          creator_name: creator?.full_name || 'Unknown User',
          creator_avatar: creator?.avatar_url,
          source_document: typedSourceDocument
        };
      });
      
      setNotes(notesWithCreators);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [projectId, activeTag, userId]);

  return {
    notes,
    setNotes,
    loading,
    allTags,
    setAllTags,
    fetchNotes
  };
}
