
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl h-[90vh] translate-x-[-50%] translate-y-[-50%] p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] bg-background border sm:rounded-lg flex flex-col">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="text-lg font-medium">Project Assistant</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <ProjectChatMessage key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-muted/30">
            {messages.length > 0 && (
              <div className="mb-3">
                <ProjectChatSuggestions 
                  questions={predefinedQuestions} 
                  onSelectQuestion={sendMessage} 
                  compact 
                />
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <ProjectChatInput onSendMessage={sendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export default ProjectChatFullscreen;
