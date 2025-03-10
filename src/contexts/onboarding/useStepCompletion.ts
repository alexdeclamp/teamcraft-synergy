
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingStep } from './types';

export const useStepCompletion = (
  steps: OnboardingStep[],
  setSteps: (steps: OnboardingStep[]) => void,
  currentStepIndex: number,
  setCurrentStepIndex: (index: number) => void,
  isOnboardingActive: boolean
) => {
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

          // Check for summaries
          if (!updatedSteps[4].isCompleted && updatedSteps[3].isCompleted) {
            updatedSteps[4].isCompleted = true;
            setCurrentStepIndex(prevIndex => prevIndex === 4 ? 5 : prevIndex);
          }

          // Check for members
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
  }, [steps, isOnboardingActive, setSteps, setCurrentStepIndex]);
};
