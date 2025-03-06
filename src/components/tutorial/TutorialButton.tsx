
import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ onClick, className }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={className}
            onClick={onClick}
          >
            <GraduationCap className="h-4 w-4 mr-1" />
            Tutorial
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Start the guided tutorial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TutorialButton;
