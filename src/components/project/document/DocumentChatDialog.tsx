
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizontal, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import ProjectChatMessage from '@/components/project/chat/ProjectChatMessage';

interface DocumentChatDialogProps {
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

const DocumentChatDialog: React.FC<DocumentChatDialogProps> = ({
  isOpen,
  onClose,
  document,
  projectId
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDocumentReady, setIsDocumentReady] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Check if document has content on load
  useEffect(() => {
    if (isOpen) {
      const hasContent = document.content_text && document.content_text.trim() !== '';
      setIsDocumentReady(hasContent);
      
      // Initial welcome message
      setMessages([{ 
        role: 'assistant', 
        content: hasContent
          ? `👋 I'm your PDF assistant for "${document.file_name}". Ask me anything about this document!` 
          : `👋 Welcome! It looks like the text extraction for "${document.file_name}" is not complete yet. Please try again in a few moments, or try re-uploading the PDF.`
      }]);
    }
  }, [isOpen, document]);
  
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
            setMessages([{ 
              role: 'assistant', 
              content: `👋 I'm your PDF assistant for "${document.file_name}". Ask me anything about this document!` 
            }]);
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
  }, [isOpen, isDocumentReady, document.id, document.file_name]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isLoading || !isDocumentReady) return;
    
    const userMessage = messageInput.trim();
    setMessageInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
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
        throw new Error('Document content is not available. The PDF extraction is still in progress or failed.');
      }
      
      console.log(`Chatting with "${document.file_name}" using ${documentData.content_text.length} characters of text`);
      
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          message: userMessage,
          documentContext: documentData.content_text,
          projectId
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
        throw new Error('Invalid response from chat service');
      }
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error: any) {
      console.error('Error chatting with PDF:', error);
      toast.error(`Failed to get response: ${error.message || 'Unknown error'}`);
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message || "I'm sorry, I encountered an error processing your request. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with "{document.file_name}"</DialogTitle>
          <DialogDescription>
            Ask questions about this document to get AI-powered answers
          </DialogDescription>
        </DialogHeader>
        
        {!isDocumentReady && (
          <div className="mb-4 p-3 border rounded-md bg-amber-50 text-amber-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              The text extraction for this PDF is still in progress. You'll be able to chat with it once processing is complete.
            </p>
          </div>
        )}
        
        <div className="flex flex-col h-[500px]">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4 p-2">
              {messages.map((message, index) => (
                <ProjectChatMessage key={index} message={message} />
              ))}
              
              {isLoading && (
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
                disabled={isLoading || !isDocumentReady}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !messageInput.trim() || !isDocumentReady}
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
  );
};

export default DocumentChatDialog;
