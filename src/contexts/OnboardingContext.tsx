import React, { createContext, useContext } from 'react';
import { OnboardingContextType } from './onboarding/types';
import { useOnboardingState } from './onboarding/useOnboardingState';
import { useStepCompletion } from './onboarding/useStepCompletion';
import { initialSteps } from './onboarding/steps';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    steps,
    setSteps,
    currentStepIndex,
    setCurrentStepIndex,
    isOnboardingActive,
    setIsOnboardingActive,
    isOnboardingCompleted,
    setIsOnboardingCompleted,
  } = useOnboardingState();

  useStepCompletion(
    steps,
    setSteps,
    currentStepIndex,
    setCurrentStepIndex,
    isOnboardingActive
  );

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
  };

  const completeStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const updatedSteps = [...steps];
    updatedSteps[stepIndex].isCompleted = true;
    setSteps(updatedSteps);

    if (stepIndex === currentStepIndex && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }

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

export type { OnboardingStep } from './onboarding/types';
