
import React, { useState, useEffect, useRef } from 'react';
import { Eye, MessageSquare, HelpCircle, FileText, FileSearch, Download, AlertCircle, ExternalLink, Info, BookText, SendHorizontal } from 'lucide-react';
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';

interface DocumentPdfActionsProps {
  onGenerateSummary: () => void; // Added this property to fix the TypeScript error
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
  
  const [showChatWithTextModal, setShowChatWithTextModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollAreaRef.current && showChatWithTextModal) {
      const scrollElement = chatScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages, showChatWithTextModal]);

  const handleChatWithText = () => {
    if (!extractedText) {
      toast.error('No text available to chat with');
      return;
    }

    setShowChatWithTextModal(true);
    
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: `👋 I'm your document assistant for "${fileName}". Ask me any questions about this document!`
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isChatLoading) return;
    
    const userMessage = messageInput.trim();
    setMessageInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);
    
    try {
      console.log('Sending message to chat-with-pdf function with document context length:', extractedText.length);
      
      const trimmedContext = extractedText.length > 100000 
        ? extractedText.substring(0, 100000) + "... [text truncated due to size]" 
        : extractedText;
      
      const response = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          pdfUrl,
          fileName,
          message: userMessage,
          documentContext: trimmedContext,
          model: 'openai'
        },
        // Add timeout to prevent hanging requests
        options: {
          timeout: 60000 // 60 seconds timeout
        }
      });
      
      const { data, error } = response;
      
      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Error calling function: ${error.message}`);
      }
      
      if (!data || !data.success || !data.answer) {
        const errorMsg = data?.error || 'Invalid response from chat service';
        console.error('Service error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Received response from chat-with-pdf function:', data);
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error: any) {
      console.error('Error chatting with document text:', error);
      toast.error(`Failed to get response: ${error.message || 'Unknown error'}`);
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error processing your request. Please try extracting the text again or with a smaller document." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExtractText = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setDiagnosisInfo(null);
    setPdfInfo(null);
    setExtractedText('');
    setSummary('');
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
        maxLength: 2000
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

  const formatChatMessage = (message: {role: 'user' | 'assistant', content: string}) => {
    return (
      <div 
        key={`message-${Math.random()}`} 
        className={`mb-4 ${message.role === 'assistant' ? 'pr-8' : 'pl-8'}`}
      >
        <div 
          className={`px-4 py-3 rounded-lg ${
            message.role === 'assistant' 
              ? 'bg-muted text-foreground rounded-tl-none' 
              : 'bg-primary text-primary-foreground ml-auto rounded-tr-none'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
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
              <div className="flex gap-2">
                {!showSummary && (
                  <>
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
                    
                    <Button 
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={handleChatWithText}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat with Text
                    </Button>
                  </>
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

      <Dialog open={showChatWithTextModal} onOpenChange={setShowChatWithTextModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <div className="absolute right-4 top-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
          
          <DialogHeader>
            <DialogTitle>Chat about "{fileName}"</DialogTitle>
            <DialogDescription>
              Ask questions about the extracted text content to get AI-powered answers
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-[500px]">
            <ScrollArea ref={chatScrollAreaRef} className="flex-1 pr-4">
              <div className="space-y-2 p-2">
                {chatMessages.map((message, index) => (
                  formatChatMessage(message)
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="pt-4 border-t mt-4">
              <div className="flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  className="min-h-[60px]"
                  onKeyDown={handleKeyDown}
                  disabled={isChatLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !messageInput.trim()}
                  className="px-3"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send. Use Shift+Enter for a new line.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentPdfActions;
