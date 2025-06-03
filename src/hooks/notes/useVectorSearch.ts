
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VectorSearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  text_rank?: number;
}

export function useVectorSearch() {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([]);

  const searchNotes = useCallback(async (
    query: string, 
    projectId?: string, 
    searchType: 'semantic' | 'hybrid' = 'semantic',
    textQuery: string = '',
    limit: number = 10
  ) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    try {
      setSearching(true);
      
      const { data, error } = await supabase.functions.invoke('vector-search-notes', {
        body: { 
          query, 
          projectId, 
          searchType,
          textQuery,
          limit 
        }
      });

      if (error) throw error;
      
      const results = data?.results || [];
      setSearchResults(results);
      return results;
    } catch (error: any) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
      return [];
    } finally {
      setSearching(false);
    }
  }, []); // No dependencies - this function should be stable

  const findSimilarNotes = useCallback(async (noteId: string, projectId?: string, limit: number = 5) => {
    try {
      // First get the current note content to use as query
      const { data: note, error: noteError } = await supabase
        .from('project_notes')
        .select('title, content')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      const query = `${note.title} ${note.content || ''}`.trim();
      if (!query) return [];
      
      // Call searchNotes directly instead of through the hook reference
      try {
        const { data, error } = await supabase.functions.invoke('vector-search-notes', {
          body: { 
            query, 
            projectId, 
            searchType: 'semantic',
            textQuery: '',
            limit 
          }
        });

        if (error) throw error;
        
        return data?.results || [];
      } catch (error: any) {
        console.error('Error in vector search:', error);
        return [];
      }
    } catch (error: any) {
      console.error('Error finding similar notes:', error);
      toast.error('Failed to find similar notes');
      return [];
    }
  }, []); // No dependencies - this function should be stable

  return {
    searching,
    searchResults,
    searchNotes,
    findSimilarNotes,
    setSearchResults
  };
}
