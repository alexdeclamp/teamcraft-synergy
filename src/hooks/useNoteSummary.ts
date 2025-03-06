
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseNoteSummaryProps {
  noteId: string;
  noteContent: string | null;
  projectId?: string;
}

export function useNoteSummary({ noteId, noteContent, projectId }: UseNoteSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          setSummary(data.summary); // Set both states to ensure consistency
        } else {
          console.log('No saved summary found for note:', noteId);
          setSavedSummary(null);
          setSummary(''); // Reset summary when no saved summary exists
        }
      } catch (error) {
        console.error('Error fetching saved summary:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };
    
    fetchSavedSummary();
  }, [noteId, projectId]);

  const generateSummary = async () => {
    if (!noteContent) {
      toast.error('Cannot generate summary for empty note content');
      return;
    }

    if (!projectId) {
      toast.error('Project ID is required for generating summaries');
      return;
    }

    try {
      setIsGenerating(true);
      setIsDialogOpen(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in to generate summaries');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'note',
          content: noteContent,
          projectId,
          userId: user.user.id,
          noteId,
        },
      });

      if (error) {
        console.error('Error from generate-summary function:', error);
        throw error;
      }
      
      if (!data || !data.summary) {
        throw new Error('Received empty or invalid response from the summary generator');
      }
      
      setSummary(data.summary);
      setSavedSummary(data.summary); // Update both states when a new summary is generated
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
      if (!savedSummary) {
        setIsDialogOpen(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    summary,
    savedSummary,
    isDialogOpen,
    setIsDialogOpen,
    generateSummary
  };
}
