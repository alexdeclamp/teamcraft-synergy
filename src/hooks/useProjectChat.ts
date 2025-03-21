
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
      // Call the Supabase edge function
      const response = await supabase.functions.invoke('project-chat', {
        body: {
          projectId,
          message: messageContent,
          userId: user.id,
          description: state.projectData.description,
          aiPersona: state.projectData.aiPersona
        }
      });

      // Check for errors in the response
      if (response.error) {
        console.error('Error from edge function:', response.error);
        
        // Check if the error contains information about API limits
        const errorMessage = response.error.message || '';
        const isApiLimitError = 
          errorMessage.includes('Daily API limit reached') || 
          (response.data && response.data.limitReached);
        
        if (isApiLimitError) {
          const limitError = 'Daily API limit reached. Free accounts are limited to 10 AI operations per day. Please upgrade to Pro for unlimited API calls.';
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: limitError
          }));
          
          toast.error('Daily AI API limit reached', {
            description: 'Free accounts are limited to 10 AI operations per day. Upgrade to Pro for unlimited API calls.'
          });
          return;
        }
        
        // General error handling
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to send message. Please try again later.'
        }));
        
        toast.error('Error', {
          description: 'Failed to send message. Please try again.',
        });
        return;
      }
      
      // Process successful response
      if (response.data) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'assistant', content: response.data.response }],
          isLoading: false
        }));
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Exception sending message:', error);
      
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
