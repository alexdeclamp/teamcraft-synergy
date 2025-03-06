
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, SendHorizontal, MessageSquare, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectChatProps {
  projectId: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<{
    description: string | null;
    aiPersona: string | null;
  }>({ description: null, aiPersona: null });
  const { toast } = useToast();
  const { user } = useAuth();

  // Predefined questions that users can select
  const predefinedQuestions = [
    "What's the latest update on this project?",
    "Summarize the project notes",
    "What are the key documents in this project?",
    "Show me recent activity",
    "What's the project status?",
    "What are the important items in this project?",
    "Show me my favorite documents",
  ];

  // Fetch project description and AI persona
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('description, ai_persona')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setProjectData({
          description: data.description,
          aiPersona: data.ai_persona
        });
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const sendMessage = async (userMessage?: string) => {
    if ((!input.trim() && !userMessage) || !user) return;

    const messageToSend = userMessage || input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('project-chat', {
        body: {
          projectId,
          message: messageToSend,
          userId: user.id,
          description: projectData.description,
          aiPersona: projectData.aiPersona
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredefinedQuestion = (question: string) => {
    setInput(question);
    sendMessage(question);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-lg font-medium">Project Assistant</h3>
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted text-muted-foreground mr-4'
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
        </div>
      </ScrollArea>
      
      {messages.length === 0 && !isLoading && (
        <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Project Assistant</h3>
          <p className="text-muted-foreground mb-4">Ask questions about your project or select a suggested question below.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {predefinedQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="text-sm" 
                onClick={() => handlePredefinedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        {messages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {predefinedQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => handlePredefinedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your project..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-3"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectChat;
