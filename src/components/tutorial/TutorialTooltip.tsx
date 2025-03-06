
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TutorialStep } from '@/hooks/useTutorial';

interface TutorialTooltipProps {
  step: TutorialStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onClose
}) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX + (rect.width / 2) - 150
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [step.targetId]);

  return createPortal(
    <div 
      className="fixed z-50 w-[300px] bg-background shadow-lg rounded-lg border p-4 animate-fade-in"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        maxWidth: 'calc(100vw - 32px)'
      }}
    >
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-background border-t border-l"></div>
      
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">{step.title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onNext}
        >
          {isLastStep ? 'Finish' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>,
    document.body
  );
};

export default TutorialTooltip;
