
import { useState, useCallback, useEffect } from 'react';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetId: string;
};

export type TutorialConfig = {
  steps: TutorialStep[];
  onComplete?: () => void;
};

export const useTutorial = (config: TutorialConfig) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  const stopTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < config.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tutorial completed
      setIsActive(false);
      setHasCompletedTutorial(true);
      if (config.onComplete) {
        config.onComplete();
      }
    }
  }, [currentStepIndex, config]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    // Scroll to the current step target element
    if (isActive && currentStep) {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep]);

  return {
    isActive,
    startTutorial,
    stopTutorial,
    nextStep,
    previousStep,
    currentStep,
    currentStepIndex,
    totalSteps: config.steps.length,
    isLastStep,
    isFirstStep,
    hasCompletedTutorial
  };
};
