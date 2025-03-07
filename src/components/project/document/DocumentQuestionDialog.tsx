
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SummaryDialogHeader from '@/components/summary/SummaryDialogHeader';
import SummaryContent from '@/components/summary/SummaryContent';
import SummaryActions from '@/components/summary/SummaryActions';
import SummaryFeedback from '@/components/summary/SummaryFeedback';
import { useAuth } from '@/contexts/AuthContext';

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
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const { user } = useAuth();
  
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
      setFeedbackGiven(false);
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
      console.log('Document URL:', document.file_url);
      
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          message: question,
          documentContext: documentContent || document.content_text || ''
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

  const handleCopy = () => {
    if (!answer || answer.trim() === '') {
      toast.error("No answer available to copy");
      return;
    }
    navigator.clipboard.writeText(answer);
    toast.success('Answer copied to clipboard');
  };

  const handleDownload = () => {
    if (!answer || answer.trim() === '') {
      toast.error("No answer available to download");
      return;
    }
    const blob = new Blob([answer], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.file_name.replace(/\s+/g, '-').toLowerCase()}-answer.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Answer downloaded successfully');
  };

  const handleFeedback = (isPositive: boolean) => {
    toast.success(`Thank you for your feedback!`);
    setFeedbackGiven(true);
  };

  const handleCreateNote = async () => {
    if (!answer || answer.trim() === '' || !projectId || !user) {
      toast.error("Cannot create note from this answer");
      return;
    }

    try {
      setIsCreatingNote(true);
      
      const { data, error } = await supabase
        .from('project_notes')
        .insert({
          title: `Q&A: ${question.length > 30 ? question.substring(0, 30) + '...' : question}`,
          content: `Question: ${question}\n\nAnswer: ${answer}`,
          project_id: projectId,
          user_id: user.id,
          tags: ['document', 'question', 'ai-generated']
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Note created successfully from Q&A');
      onClose();
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error(`Failed to create note: ${error.message}`);
    } finally {
      setIsCreatingNote(false);
    }
  };

  // First page of the dialog - asking the question
  if (!isLoading && !answer) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) onClose();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <SummaryDialogHeader
            title={`Ask about "${document.file_name}"`}
            hasSavedVersion={false}
            isLoading={false}
          />
          
          <div className="mt-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this document?"
              className="min-h-[120px]"
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button 
              onClick={handleAskQuestion} 
              disabled={!question.trim()}
              className="gap-2"
            >
              <SendHorizontal className="h-4 w-4" />
              Ask Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Second page - showing the answer (or loading)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <SummaryDialogHeader 
          title={`Answer about "${document.file_name}"`}
          hasSavedVersion={false}
          isLoading={isLoading}
        />
        
        <div className="mt-4 overflow-y-auto flex-grow">
          <div className="mb-3 text-sm text-muted-foreground">
            <strong>Your question:</strong> {question}
          </div>
          <SummaryContent 
            isLoading={isLoading}
            summary={answer}
            hasSummary={!!answer && !isLoading}
          />
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-4">
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {!isLoading && answer && !feedbackGiven && (
              <SummaryFeedback 
                feedbackGiven={feedbackGiven}
                onFeedback={handleFeedback}
              />
            )}
            {feedbackGiven && (
              <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleCreateNote} 
              size="sm" 
              disabled={isCreatingNote || !answer.trim()}
              className="gap-1"
            >
              {isCreatingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Create Note</span>
              )}
            </Button>
            <Button 
              onClick={handleCopy}
              size="sm" 
              variant="outline" 
              disabled={!answer.trim()}
            >
              Copy
            </Button>
            <Button 
              onClick={handleDownload}
              size="sm" 
              variant="outline" 
              disabled={!answer.trim()}
            >
              Download
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentQuestionDialog;
