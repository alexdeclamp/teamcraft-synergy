
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  action: string;
};

export interface OnboardingContextType {
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
