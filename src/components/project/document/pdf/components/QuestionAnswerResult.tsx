
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface QuestionAnswerResultProps {
  question: string;
  answer: string;
  isLoading: boolean;
}

const QuestionAnswerResult: React.FC<QuestionAnswerResultProps> = ({ 
  question, 
  answer, 
  isLoading 
}) => {
  if (!question && !answer && !isLoading) return null;
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        {question && (
          <div className="mb-2">
            <p className="font-medium text-sm">Question:</p>
            <p>{question}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Getting answer...</p>
          </div>
        ) : answer ? (
          <div className="mt-3">
            <p className="font-medium text-sm">Answer:</p>
            <div className="mt-1 text-sm whitespace-pre-wrap">{answer}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default QuestionAnswerResult;
