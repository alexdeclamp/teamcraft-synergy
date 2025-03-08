
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseBatchSummarizeProps {
  projectId: string;
  model?: 'claude' | 'openai';
}

export function useBatchSummarize({ projectId, model = 'claude' }: UseBatchSummarizeProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const summarizeDocuments = async (documents: any[]) => {
    if (!documents.length || !user) {
      toast.error('No documents selected or user not authenticated');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      setResults([]);
      
      const pdfUrls = documents.map(doc => doc.file_url);
      const fileNames = documents.map(doc => doc.file_name);
      
      toast.info(`Starting to summarize ${documents.length} document(s)...`);
      setProgress(30);
      
      const { data, error } = await supabase.functions.invoke('summarize-multiple-pdfs', {
        body: {
          pdfUrls,
          fileNames,
          projectId,
          userId: user.id,
          model
        },
      });
      
      if (error) {
        console.error('Error from summarize-multiple-pdfs function:', error);
        throw error;
      }
      
      setProgress(70);
      
      if (!data.success) {
        throw new Error('Failed to summarize documents');
      }
      
      setResults(data.results);
      
      // Create notes from summaries
      const createdNotes = [];
      
      for (const result of data.results) {
        const { data: noteData, error: noteError } = await supabase
          .from('project_notes')
          .insert({
            title: `Summary: ${result.fileName}`,
            content: result.summary,
            project_id: projectId,
            user_id: user.id,
            tags: ['pdf-summary', 'ai-generated']
          })
          .select()
          .single();
          
        if (noteError) {
          console.error(`Error creating note for ${result.fileName}:`, noteError);
          continue;
        }
        
        createdNotes.push(noteData);
      }
      
      setProgress(100);
      
      const successCount = data.totalProcessed - data.totalErrors;
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} note(s) from document summaries`);
      }
      
      if (data.totalErrors > 0) {
        toast.error(`Failed to process ${data.totalErrors} document(s)`);
      }
      
      return createdNotes;
    } catch (error: any) {
      console.error('Error summarizing documents:', error);
      toast.error(`Failed to summarize documents: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    progress,
    results,
    summarizeDocuments
  };
}
