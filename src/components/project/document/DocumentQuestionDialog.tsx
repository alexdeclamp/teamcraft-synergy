
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
import { Loader2, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  
  // Fetch document content if not already available
  useEffect(() => {
    if (isOpen && !document.content_text && !documentContent) {
      fetchDocumentContent();
    } else if (document.content_text) {
      setDocumentContent(document.content_text);
    }
    
    // Reset states when dialog opens
    if (isOpen) {
      setQuestion('');
      setAnswer('');
    }
  }, [isOpen, document.content_text]);
  
  const fetchDocumentContent = async () => {
    try {
      console.log('Attempting to fetch document content for:', document.id);
      const { data, error } = await supabase
        .from('project_documents')
        .select('content_text')
        .eq('id', document.id)
        .single();
      
      if (error) {
        console.error('Error fetching document content:', error);
        throw error;
      }
      
      if (data && data.content_text) {
        console.log('Document content fetched successfully');
        setDocumentContent(data.content_text);
      } else {
        console.log('No document content found in database, will rely on file_url');
      }
    } catch (error) {
      console.error('Failed to fetch document content:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;
    
    setIsLoading(true);
    setAnswer('');
    
    try {
      console.log('Sending question about document:', document.file_name);
      console.log('Question:', question);
      console.log('Document context available:', documentContent ? 'Yes' : 'No');
      
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          message: question,
          documentContext: documentContent || document.content_text || '',
          projectId
        }
      });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Error calling function: ${error.message}`);
      }
      
      if (!data || !data.success || !data.answer) {
        const errorMsg = data?.error || 'Invalid response from question service';
        console.error('Service error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      setAnswer(data.answer);
    } catch (error: any) {
      console.error('Error asking question about PDF:', error);
      toast.error(`Failed to get answer: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask Question About "{document.file_name}"</DialogTitle>
          <DialogDescription>
            Ask a specific question about this document to get an AI-powered answer
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Your Question</h3>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this document?"
              className="min-h-[80px]"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          
          {(answer || isLoading) && (
            <div>
              <h3 className="text-sm font-medium mb-2">Answer</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Analyzing document...</span>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose} variant="outline">Close</Button>
          <Button 
            onClick={handleAskQuestion} 
            disabled={!question.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            Ask Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentQuestionDialog;
