
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseRegenerateNoteMetadataProps {
  model?: 'claude' | 'openai';
}

export function useRegenerateNoteMetadata({ model = 'claude' }: UseRegenerateNoteMetadataProps = {}) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const regenerateTitle = async (noteContent: string | null): Promise<string | null> => {
    if (!noteContent) {
      toast.error('Cannot regenerate title for empty note content');
      return null;
    }

    try {
      setIsRegenerating(true);
      
      const { data, error } = await supabase.functions.invoke('regenerate-note-metadata', {
        body: {
          noteContent,
          type: 'title',
          model
        },
      });

      if (error) {
        console.error('Error from regenerate-note-metadata function:', error);
        throw error;
      }
      
      if (!data || !data.title) {
        throw new Error('Received empty or invalid response');
      }
      
      return data.title;
    } catch (error: any) {
      console.error('Error regenerating title:', error);
      toast.error(`Failed to regenerate title: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateTags = async (noteContent: string | null): Promise<string[] | null> => {
    if (!noteContent) {
      toast.error('Cannot regenerate tags for empty note content');
      return null;
    }

    try {
      setIsRegenerating(true);
      
      const { data, error } = await supabase.functions.invoke('regenerate-note-metadata', {
        body: {
          noteContent,
          type: 'tags',
          model
        },
      });

      if (error) {
        console.error('Error from regenerate-note-metadata function:', error);
        throw error;
      }
      
      if (!data || !data.tags || !Array.isArray(data.tags)) {
        throw new Error('Received empty or invalid response');
      }
      
      return data.tags;
    } catch (error: any) {
      console.error('Error regenerating tags:', error);
      toast.error(`Failed to regenerate tags: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateBoth = async (noteContent: string | null): Promise<{ title: string; tags: string[] } | null> => {
    if (!noteContent) {
      toast.error('Cannot regenerate metadata for empty note content');
      return null;
    }

    try {
      setIsRegenerating(true);
      
      const { data, error } = await supabase.functions.invoke('regenerate-note-metadata', {
        body: {
          noteContent,
          type: 'both',
          model
        },
      });

      if (error) {
        console.error('Error from regenerate-note-metadata function:', error);
        throw error;
      }
      
      if (!data || !data.title || !data.tags || !Array.isArray(data.tags)) {
        throw new Error('Received empty or invalid response');
      }
      
      return {
        title: data.title,
        tags: data.tags
      };
    } catch (error: any) {
      console.error('Error regenerating metadata:', error);
      toast.error(`Failed to regenerate metadata: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    isRegenerating,
    regenerateTitle,
    regenerateTags,
    regenerateBoth
  };
}
