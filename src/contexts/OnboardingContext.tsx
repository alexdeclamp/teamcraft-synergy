
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  action: string;
};

interface OnboardingContextType {
  steps: OnboardingStep[];
  currentStepIndex: number;
  isOnboardingActive: boolean;
  isOnboardingCompleted: boolean;
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bra3n!',
    description: 'Welcome to Bra3n, your collaborative hub for smarter projects. Store notes, images, PDFs, and updates effortlessly. Share and collaborate seamlessly, and let your AI assistant answer your questions instantly.',
    isCompleted: false,
    action: 'Continue'
  },
  {
    id: 'create-brain',
    title: 'Create Your First Brain',
    description: 'Create a Brain for each of your projects or topics. Think of a Brain as your project\'s central hub, storing notes, updates, images, PDFs, and more—ready for collaboration and AI-powered insights.',
    isCompleted: false,
    action: 'Create a Brain'
  },
  {
    id: 'add-note',
    title: 'Add Your First Note',
    description: 'Start by adding a note—a simple piece of text capturing your thoughts, ideas, or crucial project details. Notes keep your ideas organized and accessible, ensuring important information is always at your fingertips.',
    isCompleted: false,
    action: 'Add a Note'
  },
  {
    id: 'upload-documents',
    title: 'Upload Images and PDFs',
    description: 'Enhance your Brain by uploading images and PDFs. These documents will be automatically summarized into concise notes using our AI integration, making it effortless to capture key information.',
    isCompleted: false,
    action: 'Upload Files'
  },
  {
    id: 'ai-summaries',
    title: 'AI-Powered Summaries',
    description: 'Submit your documents, and Bra3n will automatically generate clear, insightful summaries. These summaries become part of your notes, training your Brain\'s AI model so you can quickly find answers to any question.',
    isCompleted: false,
    action: 'View Summaries'
  },
  {
    id: 'chat-with-brain',
    title: 'Chat with Your Brain',
    description: 'Ask Bra3n anything about your project. Your AI chat is continuously learning from your notes and summaries, providing fast, accurate answers whenever you need them.',
    isCompleted: false,
    action: 'Try Chatting'
  },
  {
    id: 'collaborate',
    title: 'Collaborate and Share',
    description: 'Bra3n is built for collaboration. Easily share your Brains with colleagues or teammates, allowing everyone to contribute, access information, and collaborate seamlessly.',
    isCompleted: false,
    action: 'Invite Team Member'
  },
  {
    id: 'all-set',
    title: 'You\'re All Set!',
    description: 'Visit your Brain anytime to add more content, ask questions, or create additional Brains. Start exploring now, keep improving your existing Brain, or launch a new one!',
    isCompleted: false,
    action: 'Start Using Bra3n'
  }
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    const savedSteps = localStorage.getItem('onboardingSteps');
    return savedSteps ? JSON.parse(savedSteps) : initialSteps;
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem('onboardingCurrentStep');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(() => {
    const savedStatus = localStorage.getItem('onboardingActive');
    return savedStatus ? JSON.parse(savedStatus) : false;
  });
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    const savedCompletion = localStorage.getItem('onboardingCompleted');
    return savedCompletion ? JSON.parse(savedCompletion) : false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('onboardingSteps', JSON.stringify(steps));
    localStorage.setItem('onboardingCurrentStep', currentStepIndex.toString());
    localStorage.setItem('onboardingActive', JSON.stringify(isOnboardingActive));
    localStorage.setItem('onboardingCompleted', JSON.stringify(isOnboardingCompleted));
  }, [steps, currentStepIndex, isOnboardingActive, isOnboardingCompleted]);

  // Check for user completion of steps
  useEffect(() => {
    const checkStepCompletion = async () => {
      if (!isOnboardingActive || !supabase.auth.getUser()) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedSteps = [...steps];

      // Check for brain creation
      if (!updatedSteps[1].isCompleted) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
        
        if (projects && projects.length > 0) {
          updatedSteps[1].isCompleted = true;
          setCurrentStepIndex(prevIndex => prevIndex === 1 ? 2 : prevIndex);
        }
      }

      // Only proceed with other checks if the user has created a brain
      if (updatedSteps[1].isCompleted) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
        
        if (projects && projects.length > 0) {
          const projectId = projects[0].id;

          // Check for notes
          if (!updatedSteps[2].isCompleted) {
            const { data: notes } = await supabase
              .from('project_notes')
              .select('id')
              .eq('project_id', projectId)
              .limit(1);
            
            if (notes && notes.length > 0) {
              updatedSteps[2].isCompleted = true;
              setCurrentStepIndex(prevIndex => prevIndex === 2 ? 3 : prevIndex);
            }
          }

          // Check for documents or images
          if (!updatedSteps[3].isCompleted) {
            const { data: documents } = await supabase
              .from('project_documents')
              .select('id')
              .eq('project_id', projectId)
              .limit(1);
            
            if (documents && documents.length > 0) {
              updatedSteps[3].isCompleted = true;
              setCurrentStepIndex(prevIndex => prevIndex === 3 ? 4 : prevIndex);
            }
          }

          // Check for summaries (simplified - just check if documents exist as they get auto-summarized)
          if (!updatedSteps[4].isCompleted && updatedSteps[3].isCompleted) {
            updatedSteps[4].isCompleted = true;
            setCurrentStepIndex(prevIndex => prevIndex === 4 ? 5 : prevIndex);
          }

          // Check for members (collaboration)
          if (!updatedSteps[6].isCompleted) {
            const { data: members } = await supabase
              .from('project_members')
              .select('id')
              .eq('project_id', projectId)
              .neq('user_id', user.id)
              .limit(1);
            
            if (members && members.length > 0) {
              updatedSteps[6].isCompleted = true;
              setCurrentStepIndex(prevIndex => prevIndex === 6 ? 7 : prevIndex);
            }
          }
        }
      }

      // Update steps if there were any changes
      if (JSON.stringify(updatedSteps) !== JSON.stringify(steps)) {
        setSteps(updatedSteps);
      }
    };

    const interval = setInterval(checkStepCompletion, 15000);
    checkStepCompletion(); // Initial check

    return () => clearInterval(interval);
  }, [steps, isOnboardingActive]);

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
    setSteps(initialSteps);
    setIsOnboardingCompleted(false);
  };

  const completeStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const updatedSteps = [...steps];
    updatedSteps[stepIndex].isCompleted = true;
    setSteps(updatedSteps);

    // Move to next step if current step was completed
    if (stepIndex === currentStepIndex && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }

    // If all steps are completed, mark onboarding as completed
    if (updatedSteps.every(step => step.isCompleted)) {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
  };

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    setIsOnboardingActive(false);
  };

  const resetOnboarding = () => {
    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setIsOnboardingActive(false);
    setIsOnboardingCompleted(false);
    localStorage.removeItem('onboardingSteps');
    localStorage.removeItem('onboardingCurrentStep');
    localStorage.removeItem('onboardingActive');
    localStorage.removeItem('onboardingCompleted');
  };

  return (
    <OnboardingContext.Provider 
      value={{
        steps,
        currentStepIndex,
        isOnboardingActive,
        isOnboardingCompleted,
        startOnboarding,
        completeStep,
        skipOnboarding,
        completeOnboarding,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
