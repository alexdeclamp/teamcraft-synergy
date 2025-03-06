
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseGenerateSummaryProps {
  noteContent: string | null;
  projectId?: string;
  noteId: string;
  setSummary: (summary: string) => void;
  setSavedSummary: (summary: string | null) => void;
  openDialog: () => void;
}

export function useGenerateSummary({
  noteContent,
  projectId,
  noteId,
  setSummary,
  setSavedSummary,
  openDialog
}: UseGenerateSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);

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
      openDialog();
      
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
      setSavedSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSummary
  };
}
