
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const OnboardingSidebar: React.FC = () => {
  const { 
    steps, 
    currentStepIndex, 
    isOnboardingActive,
    completeStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboarding();
  const navigate = useNavigate();

  if (!isOnboardingActive) return null;

  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleActionClick = () => {
    // Mark current step as viewed
    if (!currentStep.isCompleted) {
      completeStep(currentStep.id);
    }

    // Navigate based on step
    switch (currentStep.id) {
      case 'welcome':
        // Just mark as complete and move to next step
        break;
      case 'create-brain':
        navigate('/new-project');
        break;
      case 'add-note':
        // If user has a project, navigate to notes tab
        navigate('/dashboard');
        break;
      case 'upload-documents':
        // If user has a project, navigate to documents tab
        navigate('/dashboard');
        break;
      case 'ai-summaries':
        // If user has documents, show them
        navigate('/dashboard');
        break;
      case 'chat-with-brain':
        // Navigate to chat
        navigate('/dashboard');
        break;
      case 'collaborate':
        // Navigate to members tab if they have a project
        navigate('/dashboard');
        break;
      case 'all-set':
        completeOnboarding();
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed right-0 top-[10vh] z-50 h-[80vh] w-80 bg-background border-l shadow-lg animate-slide-in-right rounded-l-lg">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Bra3n Onboarding</h2>
          <Button variant="ghost" size="sm" onClick={skipOnboarding} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{completedSteps}/{steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="flex-1 p-4">
          <Card className="p-6 mb-4">
            <h3 className="font-semibold text-lg mb-2">{currentStep.title}</h3>
            <p className="text-muted-foreground mb-6">{currentStep.description}</p>
            <Button 
              className="w-full" 
              onClick={handleActionClick}
            >
              {currentStep.action}
            </Button>
          </Card>

          <div className="space-y-2 mt-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center p-2 rounded-md ${
                  index === currentStepIndex ? 'bg-muted' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  step.isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : index === currentStepIndex 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  index === currentStepIndex ? 'font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => skipOnboarding()}
            className="text-sm"
          >
            Skip Onboarding
          </Button>
          {currentStepIndex < steps.length - 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm" 
              onClick={() => {
                if (!currentStep.isCompleted) {
                  completeStep(currentStep.id);
                }
              }}
            >
              Skip Step <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSidebar;
