
import React, { useRef, useEffect } from 'react';
import { X, Send, Loader2, AlertCircle, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useProjectChat } from '@/hooks/useProjectChat';
import ProjectChatMessage from './ProjectChatMessage';
import ProjectChatInput from './ProjectChatInput';
import ProjectChatSuggestions from './ProjectChatSuggestions';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface ProjectChatFullscreenProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectChatFullscreen: React.FC<ProjectChatFullscreenProps> = ({
  projectId,
  isOpen,
  onClose
}) => {
  const { messages, isLoading, error, predefinedQuestions, sendMessage } = useProjectChat(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Prevent zoom on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      // Add viewport meta tag to prevent zooming
      const metaViewport = document.querySelector('meta[name=viewport]');
      const originalContent = metaViewport?.getAttribute('content') || '';
      metaViewport?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
      
      return () => {
        // Restore original viewport settings when chat closes
        metaViewport?.setAttribute('content', originalContent);
      };
    }
  }, [isMobile, isOpen]);

  // Handler for predefined questions
  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question);
  };

  // Check if error is related to API limit
  const isApiLimitError = error?.includes('Daily API limit reached');

  // Render error message if one exists
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="p-4 bg-destructive/10 rounded-md flex items-start space-x-3 my-4 max-w-3xl mx-auto">
        {isApiLimitError ? (
          <ZapOff className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-2 flex-1">
          <p className="font-medium text-destructive">
            {isApiLimitError ? 'Daily AI API Limit Reached' : 'Error sending message'}
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          
          {isApiLimitError && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/subscription')}
                className="w-full sm:w-auto mt-1"
              >
                Upgrade to Pro for unlimited API calls
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[92vh] p-0 flex flex-col bg-white/95 backdrop-blur-sm border-border/40 shadow-xl rounded-xl overflow-hidden">
        <DialogTitle className="sr-only">Project Assistant</DialogTitle>
        <DialogDescription className="sr-only">Chat with your project assistant</DialogDescription>
        
        <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
              <Send className="h-5 w-5" />
            </span>
            Project Assistant
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-background/80 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-8 px-6 md:px-10 bg-gradient-to-b from-background/50 to-background/30">
          <div className="space-y-8 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <ProjectChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-panel p-4 rounded-lg shadow-sm flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            {renderError()}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-white shadow-sm">
          {!isMobile && (
            <div className="mb-5">
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggested questions</div>
              <ProjectChatSuggestions 
                questions={predefinedQuestions} 
                onSelectQuestion={handlePredefinedQuestion} 
                compact 
              />
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            <ProjectChatInput 
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
              disabled={isApiLimitError} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectChatFullscreen;
