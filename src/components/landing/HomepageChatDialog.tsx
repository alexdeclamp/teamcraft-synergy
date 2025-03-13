
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HomepageChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomepageChatDialog: React.FC<HomepageChatDialogProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hi there! 👋 I\'m the Bra3n assistant. How can I help you today? Feel free to ask me about how Bra3n can help organize your documents, analyze content, or enhance team collaboration.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined questions relevant to Bra3n
  const suggestedQuestions = [
    "What is Bra3n?",
    "How does Bra3n organize documents?",
    "What AI features does Bra3n offer?",
    "How can Bra3n help my team collaborate?",
    "What kind of documents can Bra3n process?",
    "How does the AI chat work in Bra3n?"
  ];

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('homepage-chat', {
        body: { message: input }
      });

      setIsLoading(false);
      setInput('');
      
      if (error) {
        console.error('Error calling homepage-chat function:', error);
        toast.error('Failed to get a response. Please try again.');
        return;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setIsLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    
    // We need to use the question in the next cycle to ensure the UI updates properly
    setTimeout(() => {
      setInput('');
      setIsLoading(true);
      
      supabase.functions.invoke('homepage-chat', {
        body: { message: question }
      })
      .then(({ data, error }) => {
        setIsLoading(false);
        
        if (error) {
          console.error('Error calling homepage-chat function:', error);
          toast.error('Failed to get a response. Please try again.');
          return;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      })
      .catch(error => {
        console.error('Error in chat:', error);
        setIsLoading(false);
        toast.error('Something went wrong. Please try again.');
      });
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg h-[80vh] p-0 flex flex-col bg-white/95 backdrop-blur-sm border-border/40 shadow-xl rounded-xl overflow-hidden">
        <DialogTitle className="sr-only">Chat with Bra3n Assistant</DialogTitle>
        <DialogDescription className="sr-only">Get answers about Bra3n</DialogDescription>
        
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-2">
              <Bot className="h-4 w-4" />
            </span>
            Chat with Bra3n Assistant
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-background/80 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-6 px-4 bg-gradient-to-b from-background/50 to-background/30">
          <div className="space-y-6 max-w-full mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/50 text-foreground'
                  }`}
                >
                  <div>{message.content}</div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center ml-3">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-accent/50 text-foreground max-w-[85%] rounded-2xl px-4 py-3 shadow-sm flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white shadow-sm">
          {messages.length <= 2 && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggested questions</div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[60px] focus-visible:ring-primary/30 bg-background resize-none p-3 rounded-xl"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 rounded-full flex-shrink-0 shadow-sm p-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomepageChatDialog;
