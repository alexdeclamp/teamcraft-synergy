
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchNotes } from './notes/useFetchNotes';
import { useNoteDelete } from './notes/useNoteDelete';
import { useNoteDateFormat } from './notes/useNoteDateFormat';
import { useNoteAiModel } from './notes/useNoteAiModel';
import { useNoteTagFilter } from './notes/useNoteTagFilter';

export function useProjectNotes(projectId: string) {
  const { user } = useAuth();
  const { activeTag, setActiveTag } = useNoteTagFilter();
  const { aiModel, setAiModel } = useNoteAiModel();
  const { formatDate } = useNoteDateFormat();
  
  const {
    notes,
    setNotes,
    loading,
    allTags,
    setAllTags,
    fetchNotes
  } = useFetchNotes(projectId, user?.id, activeTag);
  
  const { handleDeleteNote } = useNoteDelete(user?.id, notes, setNotes, setAllTags);

  // Fetch notes when project loads or active tag changes
  useEffect(() => {
    fetchNotes();
  }, [projectId, activeTag, fetchNotes]);

  // Function to refresh project statistics
  const refreshProjectStats = async () => {
    await fetchNotes();
  };

  return {
    notes,
    setNotes,
    loading,
    allTags,
    setAllTags,
    activeTag,
    setActiveTag,
    aiModel,
    setAiModel,
    fetchNotes,
    handleDeleteNote,
    formatDate,
    refreshProjectStats,
    user
  };
}
