
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  documentName: string;
  documentUrl?: string;
}

const DocumentQuestionDialog: React.FC<DocumentQuestionDialogProps> = ({
  isOpen,
  onClose,
  documentText,
  documentName,
  documentUrl
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Reset messages when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
    }
  }, [isOpen]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log(`Sending message to chat-with-pdf function with document context length: ${documentText.length}`);
      
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: {
          message: userMessage.content,
          documentContext: documentText,
          fileName: documentName,
          pdfUrl: documentUrl,
          model: selectedModel
        }
      });
      
      if (error) {
        console.error('Error chatting with document text:', error);
        throw error;
      }
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process the document.'
      }]);
    } catch (error) {
      console.error('Error chatting with document text:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask Questions About This Document</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end my-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (GPT-4o mini)</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="flex-grow min-h-[300px] border rounded-md p-3 mb-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Ask a question about the document</p>
              <p className="text-xs mt-1">For example: "What are the key points in this document?"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentQuestionDialog;
