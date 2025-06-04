
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Info, Maximize2, Send, AlertCircle } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface ProjectChatProps {
  projectId: string;
  disableAutoScroll?: boolean;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, disableAutoScroll = false }) => {
  const { messages, isLoading, error, predefinedQuestions, sendMessage } = useProjectChat(projectId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Scroll to bottom when new messages are added, unless disableAutoScroll is true
  useEffect(() => {
    if (messagesEndRef.current && !disableAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, disableAutoScroll]);

  // Handler for predefined questions
  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question);
  };

  // Render error message if one exists
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="p-4 bg-destructive/10 rounded-md flex items-start space-x-3 my-4">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <p className="font-medium text-destructive">
            Error sending message
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="flex flex-col h-[600px] border shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
              <Send className="h-4 w-4" />
            </span>
            Project Assistant
          </h3>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsFullscreen(true)}
              title="Expand chat"
              className="rounded-full hover:bg-gray-100"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Expand chat</span>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
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
        <ScrollArea className="flex-1 py-6 px-4 bg-gradient-to-b from-background/50 to-background/30">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <ProjectChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-panel p-3 rounded-lg flex items-center space-x-2.5">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            {renderError()}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {messages.length === 0 && !isLoading && !error && (
          <ProjectChatWelcome 
            questions={predefinedQuestions} 
            onSelectQuestion={handlePredefinedQuestion} 
            forceShow={!isMobile} 
          />
        )}

        <div className="p-4 border-t bg-white">
          {messages.length > 0 && !isMobile && (
            <div className="mb-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggested questions</div>
              <ProjectChatSuggestions 
                questions={predefinedQuestions} 
                onSelectQuestion={handlePredefinedQuestion} 
                compact 
              />
            </div>
          )}
          <ProjectChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </Card>
    </>
  );
};

export default ProjectChat;
