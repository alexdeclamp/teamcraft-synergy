
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-lg font-medium">Project Assistant</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          {messages.length > 0 && (
            <div className="mb-3">
              <ProjectChatSuggestions 
                questions={predefinedQuestions} 
                onSelectQuestion={sendMessage} 
                compact 
              />
            </div>
          )}
          <ProjectChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectChatFullscreen;
