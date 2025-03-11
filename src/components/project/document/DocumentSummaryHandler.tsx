
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SummaryDialog from '@/components/summary/SummaryDialog';

interface DocumentSummaryHandlerProps {
  fileName: string;
  fileUrl: string;
  isPdf: boolean;
  projectId: string;
}

const DocumentSummaryHandler: React.FC<DocumentSummaryHandlerProps> = ({
  fileName,
  fileUrl,
  isPdf,
  projectId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [hasSavedSummary, setHasSavedSummary] = useState(false);

  useEffect(() => {
    const checkForExistingSummary = async () => {
      if (!isPdf) return;
      
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('id')
          .eq('project_id', projectId)
          .eq('title', `Summary: ${fileName}`)
          .maybeSingle();
        
        if (error) throw error;
        setHasSavedSummary(!!data);
      } catch (error) {
        console.error('Error checking for existing summary:', error);
      }
    };
    
    checkForExistingSummary();
  }, [fileName, isPdf, projectId]);

  const handleGenerateSummary = async () => {
    if (!isPdf) {
      toast.error('Summary generation is only available for PDF files');
      return;
    }
    
    setIsSummaryOpen(true);
    
    if (hasSavedSummary) {
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('content')
          .eq('project_id', projectId)
          .eq('title', `Summary: ${fileName}`)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.content) {
          setSummary(data.content);
          return;
        }
      } catch (error) {
        console.error('Error fetching saved summary:', error);
      }
    }
    
    setIsGenerating(true);
    setSummary('');
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          pdfUrl: fileUrl,
          fileName: fileName,
          projectId
        }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.summary) {
        throw new Error('Failed to generate summary');
      }
      
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    summary,
    isSummaryOpen,
    setIsSummaryOpen,
    hasSavedSummary,
    handleGenerateSummary,
    SummaryDialogComponent: () => (
      <SummaryDialog
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title={fileName}
        summary={summary}
        isLoading={isGenerating}
        projectId={projectId}
        imageName={fileName}
        hasSavedVersion={hasSavedSummary}
        sourceUrl={fileUrl}
        sourceType="pdf"
      />
    )
  };
};

export default DocumentSummaryHandler;
