
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SummaryFeedbackProps {
  feedbackGiven: boolean;
  onFeedback: (isPositive: boolean) => void;
}

const SummaryFeedback: React.FC<SummaryFeedbackProps> = ({
  feedbackGiven,
  onFeedback
}) => {
  if (feedbackGiven) {
    return <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>;
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mr-2">Was this summary helpful?</p>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onFeedback(true)}
        className="h-8 w-8"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onFeedback(false)}
        className="h-8 w-8"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </>
  );
};

export default SummaryFeedback;
