
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CleanType = 'format' | 'summarize' | 'enhance';

interface UseCleanNoteTextProps {
  model?: 'claude' | 'openai';
}

export function useCleanNoteText({ model = 'claude' }: UseCleanNoteTextProps = {}) {
  const [isCleaning, setIsCleaning] = useState(false);

  const cleanText = async (noteContent: string | null, cleanType: CleanType): Promise<string | null> => {
    if (!noteContent) {
      toast.error('Cannot clean empty note content');
      return null;
    }

    try {
      setIsCleaning(true);
      
      const toastId = toast.loading(`Cleaning text using ${model}...`);
      
      const { data, error, status } = await supabase.functions.invoke('clean-note-text', {
        body: {
          noteContent,
          cleanType,
          model
        },
      });

      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error from clean-note-text function:', error);
        
        // Check if the error is due to API limit being reached
        if (status === 429 || (data && data.limitReached)) {
          toast.error('Daily API limit reached. Please upgrade to Pro for unlimited API calls.');
          return null;
        }
        
        throw error;
      }
      
      if (!data || !data.cleanedText) {
        throw new Error('Received empty or invalid response');
      }
      
      toast.success(`Text ${cleanType}d successfully`);
      return data.cleanedText;
    } catch (error: any) {
      console.error(`Error ${cleanType}ing text:`, error);
      
      // Check error message for API limit reached
      if (error.message && error.message.includes('Daily API limit reached')) {
        toast.error('Daily API limit reached. Please upgrade to Pro for unlimited API calls.');
      } else {
        toast.error(`Failed to ${cleanType} text: ${error.message || 'Unknown error'}`);
      }
      
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  return {
    isCleaning,
    formatText: (noteContent: string | null) => cleanText(noteContent, 'format'),
    summarizeText: (noteContent: string | null) => cleanText(noteContent, 'summarize'),
    enhanceText: (noteContent: string | null) => cleanText(noteContent, 'enhance')
  };
}
