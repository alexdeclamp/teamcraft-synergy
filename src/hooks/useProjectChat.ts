
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  projectData: {
    description: string | null;
    aiPersona: string | null;
  };
}

export function useProjectChat(projectId: string) {
  const [state, setState] = useState<ProjectChatState>({
    messages: [],
    isLoading: false,
    error: null,
    projectData: { description: null, aiPersona: null },
  });
  const { user } = useAuth();

  // Effect to fetch project data when projectId changes
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('description, ai_persona, title')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setState(prev => ({
          ...prev,
          projectData: {
            description: data.description,
            aiPersona: data.ai_persona
          }
        }));
        
        console.log(`Loaded project data for: ${data.title} (${projectId})`);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    if (projectId) {
      // Reset messages when switching projects
      setState(prev => ({
        ...prev,
        messages: [],
        error: null
      }));
      
      fetchProjectData();
    }
  }, [projectId]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !user) return;

    // Reset any existing errors
    setState(prev => ({
      ...prev,
      error: null
    }));

    // Add user message to the list
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: messageContent }],
      isLoading: true
    }));

    try {
      const { data, error } = await supabase.functions.invoke('project-chat', {
        body: {
          projectId,
          message: messageContent,
          userId: user.id,
          description: state.projectData.description,
          aiPersona: state.projectData.aiPersona
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        
        // Check specifically for API limit reached error
        if (error.message && (
          error.message.includes('Daily API limit reached') || 
          (data && data.limitReached)
        )) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Daily API limit reached. Free accounts are limited to 10 AI operations per day. Please upgrade to Pro for unlimited API calls.'
          }));
          
          toast.error('Daily AI API limit reached', {
            description: 'Free accounts are limited to 10 AI operations per day. Upgrade to Pro for unlimited API calls.'
          });
          return;
        }
        
        throw error;
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: data.response }],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Set a generic error message or use the one from the error if available
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to send message. Please try again later.'
      }));
      
      toast.error('Error', {
        description: 'Failed to send message. Please try again.',
      });
    }
  };

  // Predefined questions that are relevant for any project
  const predefinedQuestions = [
    "What's the latest update on this project?",
    "Summarize the project notes",
    "What are the key documents in this project?",
    "Show me recent activity",
    "What's the project status?",
    "What are the important items in this project?",
    "Show me my favorite documents"
  ];

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    predefinedQuestions,
    sendMessage
  };
}
