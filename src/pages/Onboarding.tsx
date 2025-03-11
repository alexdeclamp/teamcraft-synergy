
import React from 'react';
import { GraduationCap, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

const Onboarding = () => {
  const { steps, currentStepIndex, startOnboarding, resetOnboarding } = useOnboarding();

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <div className="space-x-4">
          <Button onClick={startOnboarding}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Start Onboarding
          </Button>
          <Button variant="outline" onClick={resetOnboarding}>
            Reset Progress
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : index === currentStepIndex 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
