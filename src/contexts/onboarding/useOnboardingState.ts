
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingStep } from './types';
import { initialSteps } from './steps';

export const useOnboardingState = () => {
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

  return {
    steps,
    setSteps,
    currentStepIndex,
    setCurrentStepIndex,
    isOnboardingActive,
    setIsOnboardingActive,
    isOnboardingCompleted,
    setIsOnboardingCompleted,
    navigate
  };
};
