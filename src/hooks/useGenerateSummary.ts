
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseGenerateSummaryProps {
  noteContent: string | null;
  projectId?: string;
  noteId: string;
  noteName?: string;
  setSummary: (summary: string) => void;
  setSavedSummary: (summary: string | null) => void;
  setHasSummary: (has: boolean) => void;
  openDialog: () => void;
}

export function useGenerateSummary({
  noteContent,
  projectId,
  noteId,
  noteName,
  setSummary,
  setSavedSummary,
  setHasSummary,
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
      setHasSummary(false); // Reset state while generating
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
          noteName
        },
      });

      if (error) {
        console.error('Error from generate-summary function:', error);
        
        // Check if the error is due to API limit being reached by message content
        if (error.message?.includes('Daily API limit reached') || (data && data.limitReached)) {
          toast.error('You have reached your daily AI API limit. Please upgrade to Pro for unlimited API calls.', {
            description: 'Free accounts are limited to 10 AI operations per day.'
          });
          return;
        }
        
        throw error;
      }
      
      if (!data || !data.summary) {
        throw new Error('Received empty or invalid response from the summary generator');
      }
      
      setSummary(data.summary);
      setSavedSummary(data.summary);
      setHasSummary(true);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      
      // Check error message for API limit reached
      if (error.message && error.message.includes('Daily API limit reached')) {
        toast.error('You have reached your daily AI API limit. Please upgrade to Pro for unlimited API calls.', {
          description: 'Free accounts are limited to 10 AI operations per day.'
        });
      } else {
        toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
      }
      
      setHasSummary(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSummary
  };
}
