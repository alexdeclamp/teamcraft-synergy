
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { chatPrompts } from '@/utils/aiPrompts';

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
      // Système prompt plus casual et conversationnel
      const casualSystemPrompt = `Tu es l'assistant IA de ce projet, mais avec un style décontracté et friendly. 
      Tu tutoyé toujours l'utilisateur et tu es là pour l'aider à naviguer dans son projet de manière naturelle.
      
      Voici les infos sur le projet "${state.projectData.description || 'sans description'}" :
      
      Style de réponse :
      - Ton casual et amical (tutoiement)
      - Réponses courtes mais utiles
      - Emojis bienvenus 
      - Suggestions proactives
      - Navigation naturelle ("va voir tes notes", "check tes images", etc.)
      
      Fonctionnalités spéciales :
      - Quand l'user demande d'explorer une section, suggère-lui d'y aller
      - Fais des liens entre les différents éléments du projet
      - Priorise les éléments favoris et importants
      - Sois proactif dans tes suggestions
      
      Réponds de manière conversationnelle, comme si tu étais un collègue sympa qui connaît bien le projet.`;
      
      // Call the Supabase edge function
      const response = await supabase.functions.invoke('project-chat', {
        body: {
          projectId,
          message: messageContent,
          userId: user.id,
          description: state.projectData.description,
          aiPersona: state.projectData.aiPersona,
          systemPrompt: casualSystemPrompt
        }
      });

      // Check for errors in the response
      if (response.error) {
        console.error('Error from edge function:', response.error);
        
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

  // Questions prédéfinies plus casual
  const predefinedQuestions = [
    "Quoi de neuf sur ce projet ? 🚀",
    "Résume-moi l'essentiel",
    "Mes notes importantes du moment",
    "Qu'est-ce qui mérite mon attention ?",
    "Dernière activité de l'équipe",
    "Mes documents favoris",
    "Comment ça avance globalement ?",
    "Points bloquants actuels ?"
  ];

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    predefinedQuestions,
    sendMessage
  };
}
