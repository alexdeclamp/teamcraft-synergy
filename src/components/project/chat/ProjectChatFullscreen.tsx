
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useProjectChat } from '@/hooks/useProjectChat';
import ProjectChatMessage from './ProjectChatMessage';
import ProjectChatInput from './ProjectChatInput';
import ProjectChatSuggestions from './ProjectChatSuggestions';

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
  const { messages, isLoading, predefinedQuestions, sendMessage } = useProjectChat(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handler for predefined questions that defaults to openai
  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question, 'openai');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col bg-white/95 backdrop-blur-sm border-border/50 shadow-lg rounded-xl">
        <DialogTitle className="sr-only">Project Assistant</DialogTitle>
        <DialogDescription className="sr-only">Chat with your project assistant</DialogDescription>
        
        <div className="flex justify-between items-center p-4 border-b bg-muted/30">
          <h2 className="text-xl font-semibold text-foreground">Project Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-6 px-4 md:px-8 bg-gradient-to-b from-background to-background/80">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <ProjectChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 shadow-sm">
                  <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 md:p-6 border-t bg-white shadow-sm">
          {messages.length > 0 && (
            <div className="mb-4">
              <ProjectChatSuggestions 
                questions={predefinedQuestions} 
                onSelectQuestion={handlePredefinedQuestion} 
                compact 
              />
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            <ProjectChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectChatFullscreen;
