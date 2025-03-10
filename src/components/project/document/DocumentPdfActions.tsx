
import React, { useState, useEffect, useRef } from 'react';
import { Eye, MessageSquare, HelpCircle, FileText, FileSearch, Download, AlertCircle, ExternalLink, Info, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Loader2, X } from 'lucide-react';
import { extractPdfText, getPdfInfo } from '@/utils/pdfUtils';
import { summarizeText, SummaryModel } from '@/utils/summaryUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentPdfActionsProps {
  onGenerateSummary: () => void;
  isGenerating: boolean;
  onChatClick: () => void;
  onAskQuestion: () => void;
  hasSavedSummary?: boolean;
  pdfUrl: string;
  fileName: string;
  projectId?: string;
}

const DocumentPdfActions: React.FC<DocumentPdfActionsProps> = ({
  onGenerateSummary,
  isGenerating,
  onChatClick,
  onAskQuestion,
  hasSavedSummary = false,
  pdfUrl,
  fileName,
  projectId
}) => {
  const [showTextModal, setShowTextModal] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [diagnosisInfo, setDiagnosisInfo] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{pageCount: number; isEncrypted: boolean; fingerprint: string} | null>(null);
  const [textLength, setTextLength] = useState(0);
  const textContainerRef = useRef<HTMLPreElement>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const handleDisabledFeatureClick = () => {
    toast.info("This feature is currently disabled");
  };

  const verifyPdfUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('Verifying PDF URL:', url);
      
      try {
        new URL(url);
      } catch (e) {
        throw new Error(`Invalid URL format: ${e.message}`);
      }
      
      const headResponse = await fetch(url, { method: 'HEAD' });
      
      if (!headResponse.ok) {
        throw new Error(`PDF URL is not accessible: ${headResponse.status} ${headResponse.statusText}`);
      }
      
      console.log('PDF URL is valid and accessible');
      return true;
    } catch (error: any) {
      console.error('PDF URL verification failed:', error);
      setDiagnosisInfo(`URL verification failed: ${error.message}`);
      return false;
    }
  };

  const handleExtractText = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setDiagnosisInfo(null);
    setPdfInfo(null);
    setExtractedText(''); // Clear previous text
    setSummary(''); // Clear previous summary
    setShowSummary(false);
    setShowTextModal(true);
    
    try {
      toast.info("Extracting text from PDF...", {
        duration: 5000,
      });
      
      console.log('PDF URL to extract:', pdfUrl);
      
      const isUrlValid = await verifyPdfUrl(pdfUrl);
      
      if (!isUrlValid) {
        throw new Error('PDF URL is not accessible. Please check the file exists and try again.');
      }
      
      try {
        const info = await getPdfInfo(pdfUrl);
        setPdfInfo(info);
        console.log('PDF info:', info);
        
        if (info.isEncrypted) {
          setDiagnosisInfo('Warning: This PDF appears to be encrypted, which may limit text extraction');
        }
      } catch (infoError) {
        console.error('Failed to get PDF info:', infoError);
      }
      
      try {
        const result = await extractPdfText(pdfUrl);
        if (result.text && result.text.trim().length > 0) {
          setExtractedText(result.text);
          setPageCount(result.pageCount || 0);
          setTextLength(result.text.length);
          toast.success(`Successfully extracted ${result.text.length.toLocaleString()} characters from ${result.pageCount || 0} pages`);
        } else {
          setExtractedText('');
          toast.warning("No text content found in the document.");
        }
      } catch (extractionError: any) {
        console.error('PDF extraction failed:', extractionError);
        setDiagnosisInfo(`Extraction error: ${extractionError.message}`);
        throw extractionError;
      }
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

  const handleSummarizeText = async (model: SummaryModel = 'claude') => {
    if (!extractedText) {
      toast.error('No text available to summarize');
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      console.log(`Starting summarization with ${model}...`);
      console.log(`Text length: ${extractedText.length} characters`);
      
      const result = await summarizeText({
        text: extractedText,
        model,
        title: fileName,
        projectId,
        maxLength: 2000 // Increasing max length for better summaries
      });

      console.log("Summary received:", result ? "success" : "empty");
      if (!result) {
        throw new Error("Received empty summary");
      }

      setSummary(result);
      setShowSummary(true);
      toast.success(`Text summarized successfully using ${model === 'claude' ? 'Claude' : 'OpenAI'}`);
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      toast.error(`Failed to summarize: ${error.message}`);
      setShowSummary(false);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleTextView = () => {
    setShowSummary(!showSummary);
  };

  useEffect(() => {
    if (showTextModal && !isExtracting && extractedText && textContainerRef.current) {
      textContainerRef.current.style.display = 'none';
      setTimeout(() => {
        if (textContainerRef.current) {
          textContainerRef.current.style.display = 'block';
        }
      }, 0);
    }
  }, [showTextModal, isExtracting, extractedText]);

  // Format the raw PDF text for better readability
  const formatExtractedText = (text: string) => {
    if (!text) return '';
    
    // Replace consecutive spaces with a single space
    let formatted = text.replace(/[ \t]+/g, ' ');
    
    // Ensure paragraphs have consistent spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add proper indentation for paragraphs that might be continuation of text
    const lines = formatted.split('\n');
    let result = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines but preserve paragraph breaks
      if (line === '') {
        if (i > 0 && lines[i-1].trim() !== '') {
          result += '\n\n';
        }
        continue;
      }
      
      // Add the line with proper spacing
      result += line + '\n';
    }
    
    return result;
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
        onClick={onAskQuestion}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Question</span>
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onChatClick}
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
                  <Button onClick={handleRetryExtraction}>Retry Extraction</Button>
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
              <div>
                {!showSummary && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-1"
                        disabled={isSummarizing}
                      >
                        <BookText className="h-4 w-4" />
                        Summarize
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSummarizeText('claude')}>
                        Summarize with Claude
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSummarizeText('openai')}>
                        Summarize with OpenAI
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </>
  );
};

export default DocumentPdfActions;
