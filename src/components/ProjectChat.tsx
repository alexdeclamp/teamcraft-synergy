
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Info, Maximize2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProjectChat } from '@/hooks/useProjectChat';
import ProjectChatMessage from '@/components/project/chat/ProjectChatMessage';
import ProjectChatInput from '@/components/project/chat/ProjectChatInput';
import ProjectChatSuggestions from '@/components/project/chat/ProjectChatSuggestions';
import ProjectChatWelcome from '@/components/project/chat/ProjectChatWelcome';
import ProjectChatFullscreen from '@/components/project/chat/ProjectChatFullscreen';

interface ProjectChatProps {
  projectId: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId }) => {
  const { messages, isLoading, predefinedQuestions, sendMessage } = useProjectChat(projectId);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <Card className="flex flex-col h-[600px]">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-lg font-medium">Project Assistant</h3>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFullscreen(true)}
              title="Expand chat"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Information sent to AI</h4>
                  <p className="text-sm text-muted-foreground">
                    The AI assistant has access to:
                  </p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Project description</li>
                    <li>Project notes (with favorite/important flags)</li>
                    <li>Image summaries (with favorite/important flags)</li>
                    <li>Document content (with favorite/important flags)</li>
                    <li>Recent updates</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Items marked as favorites or important are prioritized in responses.
                    Archived items are included but deprioritized.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
        
        {messages.length === 0 && !isLoading && (
          <ProjectChatWelcome 
            questions={predefinedQuestions} 
            onSelectQuestion={sendMessage} 
          />
        )}

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
      </Card>

      <ProjectChatFullscreen 
        projectId={projectId}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  );
};

export default ProjectChat;
