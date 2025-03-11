
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/components/notes/types';

export function useProjectNotes(projectId: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');

  // Fetch notes based on projectId and activeTag
  const fetchNotes = async () => {
    if (!projectId || !user) return;
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
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId, activeTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!noteId || !user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);
        
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
    notes,
    setNotes,
    loading,
    allTags,
    activeTag,
    setActiveTag,
    aiModel,
    setAiModel,
    fetchNotes,
    handleDeleteNote,
    formatDate,
    user
  };
}
