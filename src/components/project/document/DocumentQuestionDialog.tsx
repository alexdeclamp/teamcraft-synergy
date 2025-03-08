
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizontal, Loader2, Copy, Download, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDialog } from '@/hooks/useDialog';
import SummaryFeedback from '@/components/summary/SummaryFeedback';

interface DocumentQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    file_name: string;
    file_url: string;
    content_text?: string;
  };
  projectId: string;
}

const DocumentQuestionDialog: React.FC<DocumentQuestionDialogProps> = ({
  isOpen,
  onClose,
  document,
  projectId
}) => {
  const [currentStep, setCurrentStep] = useState<'question' | 'answer'>('question');
  const [userQuestion, setUserQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  
  // Check if document has content on load
  useEffect(() => {
    if (isOpen) {
      const hasContent = document.content_text && document.content_text.trim() !== '';
      setIsDocumentReady(hasContent);
      
      if (currentStep === 'question' && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, currentStep, document.content_text]);
  
  // Refresh document content if not initially available
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (isOpen && !isDocumentReady) {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('project_documents')
            .select('content_text')
            .eq('id', document.id)
            .single();
            
          if (error) throw error;
          
          if (data && data.content_text && data.content_text.trim() !== '') {
            setIsDocumentReady(true);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Error checking document content:', error);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isDocumentReady, document.id]);
  
  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isLoading || !isDocumentReady) return;
    
    setIsLoading(true);
    setCurrentStep('answer');
    
    try {
      // Fetch latest document content
      const { data: documentData, error: documentError } = await supabase
        .from('project_documents')
        .select('content_text')
        .eq('id', document.id)
        .single();
      
      if (documentError) throw new Error('Could not fetch document content');
      
      // Check if we have document content
      if (!documentData?.content_text || documentData.content_text.trim() === '') {
        console.log("Document content is missing or empty");
        throw new Error('Document content is not available. The PDF extraction is still in progress or failed.');
      }
      
      console.log(`Asking question about "${document.file_name}": ${userQuestion.trim()}`);
      console.log(`Document content available: ${documentData.content_text.length} characters`);
      
      const { data, error } = await supabase.functions.invoke('ask-pdf-question', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          userQuestion: userQuestion.trim(),
          documentContext: documentData.content_text
        }
      });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Error calling function: ${error.message}`);
      }
      
      if (data?.error) {
        console.error('Service error:', data.error);
        throw new Error(data.error);
      }
      
      if (!data || !data.success || !data.answer) {
        console.error('Invalid response:', data);
        throw new Error('Invalid response from service');
      }
      
      setAnswer(data.answer);
    } catch (error: any) {
      console.error('Error asking PDF question:', error);
      toast.error(`Failed to get answer: ${error.message || 'Unknown error'}`);
      setAnswer("I'm sorry, I encountered an error processing your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentStep === 'question') {
      e.preventDefault();
      handleAskQuestion();
    }
  };
  
  const handleCopy = () => {
    if (!answer) return;
    
    navigator.clipboard.writeText(answer)
      .then(() => {
        setIsCopied(true);
        toast.success('Answer copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        toast.error('Failed to copy to clipboard');
      });
  };
  
  const handleDownload = () => {
    if (!answer) return;
    
    const blob = new Blob([`Question: ${userQuestion}\n\nAnswer: ${answer}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.file_name.replace(/\.[^/.]+$/, '')}-question.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCreateNote = async () => {
    if (!answer || !userQuestion) return;
    
    try {
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title: `Question about ${document.file_name}`,
          content: `**Question:** ${userQuestion}\n\n**Answer:** ${answer}`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Created note from answer');
      onClose();
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error(`Failed to create note: ${error.message}`);
    }
  };
  
  const handleReset = () => {
    setCurrentStep('question');
    setAnswer('');
  };

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(true);
    toast.success('Thanks for your feedback!');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask a Question about "{document.file_name}"</DialogTitle>
          <DialogDescription>
            {currentStep === 'question' 
              ? 'Ask a specific question about this document to get an AI-powered answer'
              : 'AI-generated answer based on the document content'}
          </DialogDescription>
        </DialogHeader>
        
        {!isDocumentReady && (
          <div className="mb-4 p-3 border rounded-md bg-amber-50 text-amber-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              The text extraction for this PDF is still in progress. You'll be able to ask questions once processing is complete.
            </p>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {currentStep === 'question' ? (
            <div className="space-y-4 py-4">
              <Textarea
                ref={textareaRef}
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="What would you like to know about this document?"
                className="min-h-[150px] text-base"
                onKeyDown={handleKeyDown}
                disabled={!isDocumentReady}
              />
              <Button 
                onClick={handleAskQuestion} 
                className="w-full"
                disabled={!userQuestion.trim() || isLoading || !isDocumentReady}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Get Answer
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold text-sm">Your question:</p>
                <p className="mt-1">{userQuestion}</p>
              </div>
              
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div ref={answerRef} className="prose prose-sm max-w-none">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Getting your answer...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">
                      {answer}
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex flex-wrap gap-2 justify-between items-center pt-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={isLoading || !answer}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isLoading || !answer}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Ask Another Question
                  </Button>
                </div>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={isLoading || !answer}
                >
                  Create Note
                </Button>
              </div>
              
              {!isLoading && answer && (
                <div className="flex items-center justify-start mt-4">
                  {feedbackGiven ? (
                    <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mr-2">Was this answer helpful?</p>
                      <SummaryFeedback 
                        feedbackGiven={feedbackGiven}
                        onFeedback={handleFeedback}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentQuestionDialog;
