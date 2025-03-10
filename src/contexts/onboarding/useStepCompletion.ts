
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingStep } from './types';
import { checkBrainCreation, checkNotesAdded, checkDocumentsAdded, checkMembersAdded } from './stepCheckUtils';

export const useStepCompletion = (
  steps: OnboardingStep[],
  setSteps: (steps: OnboardingStep[]) => void,
  currentStepIndex: number,
  setCurrentStepIndex: (index: number) => void,
  isOnboardingActive: boolean
) => {
  useEffect(() => {
    const checkStepCompletion = async () => {
      if (!isOnboardingActive) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedSteps = [...steps];
      let hasChanges = false;
      
      // Brain creation is required before other checks
      if (!updatedSteps[1].isCompleted) {
        const brainCreated = await checkBrainCreation(user.id);
        if (brainCreated) {
          updatedSteps[1].isCompleted = true;
          setCurrentStepIndex(Math.max(currentStepIndex, 2));
          hasChanges = true;
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
          
          // Check notes
          if (!updatedSteps[2].isCompleted) {
            const notesAdded = await checkNotesAdded(projectId);
            if (notesAdded) {
              updatedSteps[2].isCompleted = true;
              setCurrentStepIndex(Math.max(currentStepIndex, 3));
              hasChanges = true;
            }
          }

          // Check documents or images
          if (!updatedSteps[3].isCompleted) {
            const documentsAdded = await checkDocumentsAdded(projectId);
            if (documentsAdded) {
              updatedSteps[3].isCompleted = true;
              setCurrentStepIndex(Math.max(currentStepIndex, 4));
              hasChanges = true;
            }
          }

          // Check for summaries - this step is auto-completed after documents are added
          if (!updatedSteps[4].isCompleted && updatedSteps[3].isCompleted) {
            updatedSteps[4].isCompleted = true;
            setCurrentStepIndex(Math.max(currentStepIndex, 5));
            hasChanges = true;
          }

          // Check for members
          if (!updatedSteps[6].isCompleted) {
            const membersAdded = await checkMembersAdded(projectId, user.id);
            if (membersAdded) {
              updatedSteps[6].isCompleted = true;
              setCurrentStepIndex(Math.max(currentStepIndex, 7));
              hasChanges = true;
            }
          }
        }
      }

      // Update steps if there were any changes
      if (hasChanges) {
        setSteps(updatedSteps);
      }
    };

    const interval = setInterval(checkStepCompletion, 15000);
    checkStepCompletion(); // Initial check

    return () => clearInterval(interval);
  }, [steps, isOnboardingActive, setSteps, setCurrentStepIndex, currentStepIndex]);
};
