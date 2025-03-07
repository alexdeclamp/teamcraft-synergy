
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Clock, FileSearch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SummaryDialog from '@/components/summary/SummaryDialog';
import { usePdfExtraction } from '@/hooks/usePdfExtraction';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    isExtracting,
    extractedInfo,
    extractInformation
  } = usePdfExtraction(document, projectId);

  const handleExtractClick = async () => {
    try {
      await extractInformation();
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error in handleExtractClick:', error);
    }
  };

  // Only show extract button for PDF documents that have a pdf_url in metadata or are direct PDFs
  const isPdf = document.document_type === 'pdf';
  const hasPdfUrl = document.metadata?.pdf_url !== undefined;
  const showExtractButton = isPdf || hasPdfUrl;

  return (
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
        {showExtractButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExtractClick}
            className="h-8 w-8 p-0"
            disabled={isExtracting}
            title="Extract Information with Claude"
          >
            <FileSearch className="h-4 w-4" />
            {isExtracting && <span className="sr-only">Extracting...</span>}
          </Button>
        )}
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <a href={document.file_url} target="_blank" rel="noopener noreferrer" title="View Document">
            <Eye className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0" title="Download Document">
          <a href={document.file_url} download={document.file_name}>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Information from "${document.file_name}"`}
        summary={extractedInfo}
        isLoading={isExtracting}
        hasSavedVersion={extractedInfo !== ''}
        projectId={projectId}
        imageName={document.file_name}
      />
    </div>
  );
};
