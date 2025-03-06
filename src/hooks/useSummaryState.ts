
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSummaryStateProps {
  noteId: string;
  projectId?: string;
}

export function useSummaryState({ noteId, projectId }: UseSummaryStateProps) {
  const [summary, setSummary] = useState('');
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Reset summary when noteId changes
  useEffect(() => {
    setSummary('');
    setSavedSummary(null);
  }, [noteId]);

  // Fetch saved summary
  useEffect(() => {
    const fetchSavedSummary = async () => {
      if (!noteId || !projectId) return;
      
      try {
        setIsLoadingSaved(true);
        console.log('Fetching saved summary for note:', noteId);
        
        const { data, error } = await supabase
          .from('note_summaries')
          .select('summary')
          .eq('note_id', noteId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching saved summary:', error.message);
          return;
        }
        
        if (data?.summary) {
          console.log('Found saved summary for note:', noteId);
          setSavedSummary(data.summary);
          setSummary(data.summary);
        } else {
          console.log('No saved summary found for note:', noteId);
          setSavedSummary(null);
          setSummary('');
        }
      } catch (error) {
        console.error('Error fetching saved summary:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };
    
    fetchSavedSummary();
  }, [noteId, projectId]);

  return {
    summary,
    setSummary,
    savedSummary,
    setSavedSummary,
    isLoadingSaved
  };
}
