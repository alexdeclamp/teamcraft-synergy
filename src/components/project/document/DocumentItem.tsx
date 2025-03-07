import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Clock, FileSearch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SummaryDialog from '@/components/summary/SummaryDialog';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  document_type: string;
  file_size?: number;
  metadata?: {
    pdf_url?: string;
    associatedNoteId?: string;
    extractedInfoNoteId?: string;
  };
}

interface DocumentItemProps {
  document: Document;
  projectId: string;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ document, projectId }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  
  // Check if there's a PDF URL in metadata or use the file_url
  const pdfUrl = document.metadata?.pdf_url || document.file_url;
  
  const handleSummarize = async () => {
    if (!pdfUrl) {
      toast.error("No PDF URL available");
      return;
    }
    
    try {
      setIsSummarizing(true);
      setSummaryDialogOpen(true); // Open dialog immediately to show loading state
      
      // Call the Supabase Edge Function to summarize the PDF
      const { data, error } = await supabase.functions.invoke('summarize-pdf', {
        body: {
          pdfUrl,
          fileName: document.file_name,
          projectId,
        }
      });
      
      if (error) {
        console.error("Error from Edge Function:", error);
        throw new Error(error.message || "Failed to call summary function");
      }
      
      if (data?.error) {
        console.error("Error in summarize-pdf function:", data.error);
        throw new Error(data.error);
      }
      
      if (data?.summary) {
        setSummary(data.summary);
      } else {
        throw new Error("No summary was generated");
      }
    } catch (error: any) {
      console.error("Error summarizing PDF:", error);
      toast.error(`Failed to summarize PDF: ${error.message || "Unknown error"}`);
      // Keep dialog open to show error state
    } finally {
      setIsSummarizing(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-md bg-accent/30 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 flex-shrink-0 text-primary/70" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{document.file_name}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            disabled={isSummarizing}
            onClick={handleSummarize}
            title="Summarize PDF"
          >
            {isSummarizing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <FileSearch className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" title="View Document">
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0" title="Download Document">
            <a href={pdfUrl} download={document.file_name}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      
      <SummaryDialog
        isOpen={summaryDialogOpen}
        onClose={() => setSummaryDialogOpen(false)}
        title={`Summary: ${document.file_name}`}
        summary={summary}
        isLoading={isSummarizing}
        hasSavedVersion={!isSummarizing && summary !== ""}
        projectId={projectId}
      />
    </>
  );
};
