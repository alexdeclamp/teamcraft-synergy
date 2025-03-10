
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StartOnboardingButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const StartOnboardingButton: React.FC<StartOnboardingButtonProps> = ({ 
  variant = "outline", 
  size = "sm",
  className = ""
}) => {
  const { startOnboarding, isOnboardingCompleted } = useOnboarding();

  if (isOnboardingCompleted) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            onClick={() => startOnboarding()}
            className={className}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Tutorial
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Start the interactive tutorial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StartOnboardingButton;
