
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNoteEmbeddings() {
  const [generating, setGenerating] = useState(false);

  const generateEmbedding = async (noteId: string, text: string) => {
    if (!text.trim()) return;

    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { noteId, text }
      });

      if (error) throw error;
      
      console.log('Embedding generated successfully for note:', noteId);
      return true;
    } catch (error: any) {
      console.error('Error generating embedding:', error);
      toast.error('Failed to generate embedding for note');
      return false;
    } finally {
      setGenerating(false);
    }
  };

  const batchGenerateEmbeddings = async (notes: Array<{ id: string; title: string; content: string | null }>) => {
    let successCount = 0;
    
    for (const note of notes) {
      const text = `${note.title} ${note.content || ''}`.trim();
      const success = await generateEmbedding(note.id, text);
      if (success) successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    toast.success(`Generated embeddings for ${successCount} out of ${notes.length} notes`);
    return successCount;
  };

  return {
    generating,
    generateEmbedding,
    batchGenerateEmbeddings
  };
}
