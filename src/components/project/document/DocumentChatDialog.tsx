
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
import { SendHorizontal, Loader2 } from 'lucide-react';
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
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Add welcome message when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { 
          role: 'assistant', 
          content: `👋 I'm your PDF assistant for "${document.file_name}". Ask me anything about this document!` 
        }
      ]);
      
      // Attempt to fetch document content if not already available
      if (!document.content_text && !documentContent) {
        fetchDocumentContent();
      } else if (document.content_text) {
        setDocumentContent(document.content_text);
      }
    }
  }, [isOpen, document.file_name, document.content_text]);
  
  // Fetch document content text if not already available
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
    if (!messageInput.trim() || isLoading) return;
    
    const userMessage = messageInput.trim();
    setMessageInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      console.log('Sending chat request with document context:', documentContent ? 'Available' : 'Not available');
      
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          pdfUrl: document.file_url,
          fileName: document.file_name,
          message: userMessage,
          documentContext: documentContent || document.content_text || '',
          projectId
        }
      });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Error calling function: ${error.message}`);
      }
      
      if (!data || !data.success || !data.answer) {
        const errorMsg = data?.error || 'Invalid response from chat service';
        console.error('Service error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error: any) {
      console.error('Error chatting with PDF:', error);
      toast.error(`Failed to get response: ${error.message || 'Unknown error'}`);
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error processing your request. Please try again." 
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
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !messageInput.trim()}
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
