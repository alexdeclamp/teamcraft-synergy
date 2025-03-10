
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
      
      // Limit batch size for better reliability
      const MAX_BATCH_SIZE = 5;
      let processedDocuments = 0;
      let successfulDocuments = 0;
      let allResults: SummaryResult[] = [];
      let allErrors: ErrorResult[] = [];
      
      // Process in smaller batches
      for (let i = 0; i < Math.ceil(documents.length / MAX_BATCH_SIZE); i++) {
        const startIdx = i * MAX_BATCH_SIZE;
        const endIdx = Math.min(startIdx + MAX_BATCH_SIZE, documents.length);
        const batchDocuments = documents.slice(startIdx, endIdx);
        
        toast.info(`Processing batch ${i + 1} of ${Math.ceil(documents.length / MAX_BATCH_SIZE)}...`);
        
        const pdfUrls = batchDocuments.map(doc => doc.file_url);
        const fileNames = batchDocuments.map(doc => doc.file_name);
        
        setProgress(prev => Math.min(80, prev + 10));
        
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
        
        if (!data.success) {
          throw new Error('Failed to summarize documents');
        }
        
        allResults = [...allResults, ...(data.results || [])];
        allErrors = [...allErrors, ...(data.errors || [])];
        
        processedDocuments += (data.results?.length || 0) + (data.errors?.length || 0);
        successfulDocuments += (data.results?.length || 0);
        
        setResults(allResults);
        setErrors(allErrors);
        
        // Update progress based on how many documents we've processed
        const progressPercentage = (processedDocuments / documents.length) * 80;
        setProgress(Math.min(90, 10 + progressPercentage));
        
        // If there are more batches, wait before processing the next one
        if (i < Math.ceil(documents.length / MAX_BATCH_SIZE) - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Create notes from summaries
      const createdNotes = [];
      
      for (const result of allResults) {
        try {
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
        } catch (noteCreateError) {
          console.error(`Error in note creation for ${result.fileName}:`, noteCreateError);
          // Continue with other notes even if one fails
        }
      }
      
      setProgress(100);
      
      const successCount = allResults?.length || 0;
      const errorCount = allErrors?.length || 0;
      
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} note(s) from document summaries`);
      }
      
      if (errorCount > 0) {
        // Show more informative error toast with details
        const errorMessage = allErrors.map(err => err.fileName).join(', ');
        toast.error(
          `Failed to process ${errorCount} document(s): ${errorMessage.length > 50 ? 
            errorMessage.substring(0, 50) + '...' : 
            errorMessage}`, 
          {
            description: "Documents may be too large, encrypted, or in an unsupported format.",
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
