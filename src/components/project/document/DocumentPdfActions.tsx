
import React, { useState } from 'react';
import { Eye, MessageSquare, HelpCircle, FileText, FileSearch, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X } from 'lucide-react';

interface DocumentPdfActionsProps {
  onGenerateSummary: () => void;
  isGenerating: boolean;
  onChatClick: () => void;
  onAskQuestion: () => void;
  hasSavedSummary?: boolean;
  pdfUrl: string;
  fileName: string;
}

const DocumentPdfActions: React.FC<DocumentPdfActionsProps> = ({
  onGenerateSummary,
  isGenerating,
  onChatClick,
  onAskQuestion,
  hasSavedSummary = false,
  pdfUrl,
  fileName
}) => {
  const [showTextModal, setShowTextModal] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleDisabledFeatureClick = () => {
    toast.info("This feature is currently disabled");
  };

  const handleExtractText = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setShowTextModal(true);
    
    try {
      toast.info("Extracting text from PDF...", {
        duration: 3000,
      });
      
      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: { pdfUrl }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.text) {
        throw new Error(data.error || 'Failed to extract text from PDF');
      }
      
      setExtractedText(data.text);
      setPageCount(data.pageCount || 0);
      toast.success(`Successfully extracted text from ${pageCount || 0} pages`);
    } catch (error: any) {
      console.error('Error extracting text:', error);
      const errorMessage = error.message || 'Failed to extract text from the PDF';
      setExtractionError(errorMessage);
      toast.error(`Extraction failed: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleRetryExtraction = () => {
    handleExtractText();
  };
  
  const handleDownloadText = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}-extracted-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Text downloaded successfully');
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onGenerateSummary}
        disabled={isGenerating}
      >
        {hasSavedSummary ? (
          <>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">View Summary</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Summarize</span>
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleExtractText}
        disabled={isExtracting}
      >
        <FileSearch className="h-4 w-4" />
        <span className="hidden sm:inline">Extract Text</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleDisabledFeatureClick}
        disabled={true}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Question</span>
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleDisabledFeatureClick}
        disabled={true}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sm:inline">Chat</span>
      </Button>

      <Dialog open={showTextModal} onOpenChange={setShowTextModal}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
          <div className="absolute right-4 top-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
          
          <DialogHeader>
            <DialogTitle>
              Extracted Text - {fileName}
              {pageCount > 0 && <span className="text-sm text-muted-foreground ml-2">({pageCount} pages)</span>}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 mt-4">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <span className="text-muted-foreground">Extracting text from PDF...</span>
                <span className="text-xs text-muted-foreground mt-1">This may take a moment for large files</span>
              </div>
            ) : extractionError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-destructive mb-4">{extractionError}</div>
                <Button onClick={handleRetryExtraction}>Retry Extraction</Button>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-mono text-sm">
                {extractedText}
              </div>
            )}
          </ScrollArea>
          
          {!isExtracting && extractedText && (
            <DialogFooter className="mt-4">
              <Button 
                onClick={handleDownloadText}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download Text
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentPdfActions;
