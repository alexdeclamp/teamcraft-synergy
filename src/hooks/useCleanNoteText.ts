
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
    if (!noteContent || noteContent.trim() === '') {
      toast.error('Cannot clean empty note content');
      return null;
    }

    try {
      setIsCleaning(true);
      
      console.log('🔧 Starting text cleaning:', { cleanType, model, contentLength: noteContent.length });
      
      const toastId = toast.loading(`${cleanType === 'format' ? 'Formatting' : cleanType === 'summarize' ? 'Summarizing' : 'Enhancing'} text using ${model}...`);
      
      const { data, error } = await supabase.functions.invoke('clean-note-text', {
        body: {
          noteContent,
          cleanType,
          model
        },
      });

      toast.dismiss(toastId);
      
      console.log('📋 Function response:', { data, error });
      
      if (error) {
        console.error('❌ Error from clean-note-text function:', error);
        throw new Error(error.message || 'Function call failed');
      }
      
      if (!data || !data.cleanedText) {
        console.error('❌ No cleaned text in response:', data);
        throw new Error('Received empty or invalid response from AI service');
      }
      
      console.log('✅ Text cleaning successful');
      toast.success(`Text ${cleanType}ed successfully`);
      return data.cleanedText;
    } catch (error: any) {
      console.error(`❌ Error ${cleanType}ing text:`, error);
      
      // More specific error messages
      let errorMessage = `Failed to ${cleanType} text`;
      if (error.message?.includes('API key')) {
        errorMessage = `API key not configured for ${model}. Please check your settings.`;
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
