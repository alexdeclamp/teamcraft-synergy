
import React, { useRef, useState } from 'react';
import { AlertCircle, Download, ExternalLink, Info, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { SummaryOptions } from './SummaryOptions';

interface TextExtractionDialogProps {
  showTextModal: boolean;
  setShowTextModal: (show: boolean) => void;
  isExtracting: boolean;
  extractedText: string;
  extractionError: string | null;
  diagnosisInfo: string | null;
  pdfInfo: { pageCount: number; isEncrypted: boolean; fingerprint: string } | null;
  textLength: number;
  pageCount: number;
  fileName: string;
  pdfUrl: string;
  onRetryExtraction: () => void;
  handleSummarizeText: (model: 'claude' | 'openai') => void;
  isSummarizing: boolean;
  summary: string;
  showSummary: boolean;
  toggleTextView: () => void;
}

const TextExtractionDialog: React.FC<TextExtractionDialogProps> = ({
  showTextModal,
  setShowTextModal,
  isExtracting,
  extractedText,
  extractionError,
  diagnosisInfo,
  pdfInfo,
  textLength,
  pageCount,
  fileName,
  pdfUrl,
  onRetryExtraction,
  handleSummarizeText,
  isSummarizing,
  summary,
  showSummary,
  toggleTextView
}) => {
  const textContainerRef = useRef<HTMLPreElement>(null);

  const handleOpenPdfDirectly = () => {
    window.open(pdfUrl, '_blank');
  };
  
  const handleDownloadText = () => {
    if (!extractedText) return;
    
    const content = showSummary && summary ? summary : extractedText;
    const fileNameSuffix = showSummary && summary ? '-summary' : '-extracted-text';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}${fileNameSuffix}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${showSummary ? 'Summary' : 'Text'} downloaded successfully`);
  };

  const formatExtractedText = (text: string) => {
    if (!text) return '';
    
    let formatted = text.replace(/[ \t]+/g, ' ');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    const lines = formatted.split('\n');
    let result = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        if (i > 0 && lines[i-1].trim() !== '') {
          result += '\n\n';
        }
        continue;
      }
      
      result += line + '\n';
    }
    
    return result;
  };
  
  return (
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
          <DialogTitle className="flex items-center justify-between">
            <div>
              {showSummary && summary ? 'Summary' : 'Extracted Text'} - {fileName}
              {pageCount > 0 && !showSummary && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({pageCount} pages, {textLength > 0 ? `${textLength.toLocaleString()} characters` : ''})
                </span>
              )}
            </div>
            {extractedText && !isExtracting && !extractionError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTextView}
                className="ml-4"
                disabled={isSummarizing || (!summary && showSummary)}
              >
                {showSummary ? 'Show Full Text' : 'Show Summary'}
              </Button>
            )}
          </DialogTitle>
          {diagnosisInfo && (
            <DialogDescription className="text-amber-500">
              <Info className="h-4 w-4 inline mr-1" />
              {diagnosisInfo}
            </DialogDescription>
          )}
          {pdfInfo && pdfInfo.isEncrypted && (
            <DialogDescription className="text-amber-500">
              <Info className="h-4 w-4 inline mr-1" />
              This PDF is encrypted which may limit text extraction capabilities.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 mt-4 max-h-[500px] overflow-auto">
          {isExtracting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <span className="text-muted-foreground">Extracting text from PDF...</span>
              <span className="text-xs text-muted-foreground mt-1">This may take a moment for large files</span>
            </div>
          ) : isSummarizing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <span className="text-muted-foreground">Summarizing text...</span>
              <span className="text-xs text-muted-foreground mt-1">This may take a moment for large documents</span>
            </div>
          ) : extractionError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <div className="text-destructive mb-4">{extractionError}</div>
              <div className="text-sm text-muted-foreground mb-6 max-w-md">
                This could be due to network issues, an invalid PDF format, or the PDF might be password-protected.
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onRetryExtraction}>Retry Extraction</Button>
                <Button variant="outline" onClick={handleOpenPdfDirectly} className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open PDF Directly
                </Button>
              </div>
            </div>
          ) : showSummary && summary ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {summary}
            </div>
          ) : extractedText ? (
            <pre 
              ref={textContainerRef}
              className="whitespace-pre-wrap font-sans text-sm w-full overflow-visible leading-relaxed p-2"
            >
              {formatExtractedText(extractedText)}
            </pre>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No text content was extracted from this PDF. It might be an image-based PDF.
            </div>
          )}
        </ScrollArea>
        
        {!isExtracting && !isSummarizing && extractedText && (
          <DialogFooter className="mt-4 flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              {!showSummary && (
                <SummaryOptions onSummarize={handleSummarizeText} />
              )}
            </div>
            <Button 
              onClick={handleDownloadText}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download {showSummary ? 'Summary' : 'Text'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TextExtractionDialog;
