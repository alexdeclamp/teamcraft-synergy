
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseBatchSummarizeProps {
  projectId: string;
  model?: 'claude' | 'openai';
}

interface SummaryResult {
  fileName: string;
  pdfUrl: string;
  summary: string;
}

interface ErrorResult {
  fileName: string;
  pdfUrl: string;
  error: string;
}

export function useBatchSummarize({ projectId, model = 'claude' }: UseBatchSummarizeProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SummaryResult[]>([]);
  const [errors, setErrors] = useState<ErrorResult[]>([]);

  const summarizeDocuments = async (documents: any[]) => {
    if (!documents.length || !user) {
      toast.error('No documents selected or user not authenticated');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      setResults([]);
      setErrors([]);
      
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
      
      setResults(data.results || []);
      setErrors(data.errors || []);
      
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
          setErrors(prev => [...prev, {
            fileName: result.fileName,
            pdfUrl: result.pdfUrl,
            error: `Failed to create note: ${noteError.message}`
          }]);
          continue;
        }
        
        createdNotes.push(noteData);
      }
      
      setProgress(100);
      
      const successCount = data.results?.length || 0;
      const errorCount = data.errors?.length || 0;
      
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} note(s) from document summaries`);
      }
      
      if (errorCount > 0) {
        // Show more informative error toast with details
        const errorMessage = data.errors.map(err => err.fileName).join(', ');
        toast.error(
          `Failed to process ${errorCount} document(s): ${errorMessage.length > 50 ? 
            errorMessage.substring(0, 50) + '...' : 
            errorMessage}`, 
          {
            description: "Check the documents for issues like encryption, corrupt files, or unsupported formats.",
            duration: 5000
          }
        );
      }
      
      return createdNotes;
    } catch (error: any) {
      console.error('Error summarizing documents:', error);
      toast.error(`Failed to summarize documents: ${error.message || 'Unknown error'}`, {
        description: "Try selecting fewer documents or check your network connection",
        duration: 5000
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    progress,
    results,
    errors,
    summarizeDocuments
  };
}
