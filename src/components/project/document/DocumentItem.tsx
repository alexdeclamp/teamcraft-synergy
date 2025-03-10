
import React, { useState, useEffect } from 'react';
import { File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SummaryDialog from '@/components/summary/SummaryDialog';
import DocumentChatDialog from './DocumentChatDialog';
import DocumentQuestionDialog from './DocumentQuestionDialog';
import DocumentActions from './DocumentActions';
import DocumentPdfActions from './DocumentPdfActions';

interface DocumentItemProps {
  document: {
    id: string;
    file_name: string;
    file_url: string;
    created_at: string;
    document_type?: string;
    file_size?: number;
    content_text?: string;
    metadata?: {
      pdf_url?: string;
    };
  };
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  projectId: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onDelete, 
  onRefresh,
  projectId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [hasSavedSummary, setHasSavedSummary] = useState(false);

  const fileExtension = document.file_name.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  const pdfUrl = document.metadata?.pdf_url || document.file_url;
  
  // Check for existing summary when component mounts
  useEffect(() => {
    const checkForExistingSummary = async () => {
      if (!isPdf) return;
      
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('id')
          .eq('project_id', projectId)
          .eq('title', `Summary: ${document.file_name}`)
          .maybeSingle();
        
        if (error) throw error;
        setHasSavedSummary(!!data);
      } catch (error) {
        console.error('Error checking for existing summary:', error);
      }
    };
    
    checkForExistingSummary();
  }, [document.file_name, isPdf, projectId]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${document.file_name}"?`);
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);
      
      if (error) throw error;
      
      toast.success(`"${document.file_name}" deleted successfully`);
      onDelete(document.id);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
  };
  
  const handleGenerateSummary = async () => {
    if (!isPdf) {
      toast.error('Summary generation is only available for PDF files');
      return;
    }
    
    setIsSummaryOpen(true);
    
    // If we already have a saved summary, try to fetch it first
    if (hasSavedSummary) {
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('content')
          .eq('project_id', projectId)
          .eq('title', `Summary: ${document.file_name}`)
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
    
    // If no saved summary found or there was an error, generate a new one
    setIsGenerating(true);
    setSummary('');
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          pdfUrl: pdfUrl,
          fileName: document.file_name,
          projectId
        }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.summary) {
        throw new Error('Failed to generate summary');
      }
      
      setSummary(data.summary);
      setHasSavedSummary(true);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatClick = () => {
    setIsChatOpen(true);
  };

  const handleAskQuestion = () => {
    setIsQuestionOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card w-full">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-muted rounded-md">
            <File className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-medium">{document.file_name}</h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(document.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPdf && (
            <DocumentPdfActions
              onGenerateSummary={handleGenerateSummary}
              isGenerating={isGenerating}
              onChatClick={handleChatClick}
              onAskQuestion={handleAskQuestion}
              hasSavedSummary={hasSavedSummary}
            />
          )}
          
          <DocumentActions
            fileName={document.file_name}
            fileUrl={document.file_url}
            onDelete={handleDelete}
          />
        </div>
      </div>
      
      <SummaryDialog
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title={document.file_name}
        summary={summary}
        isLoading={isGenerating}
        projectId={projectId}
        imageName={document.file_name}
        hasSavedVersion={hasSavedSummary}
        sourceUrl={pdfUrl}
        sourceType="pdf"
      />
      
      <DocumentChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        document={document}
        projectId={projectId}
      />
      
      <DocumentQuestionDialog
        isOpen={isQuestionOpen}
        onClose={() => setIsQuestionOpen(false)}
        document={document}
        projectId={projectId}
      />
    </>
  );
};

export default DocumentItem;
