
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectChatSuggestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  compact?: boolean;
  forceShow?: boolean;
}

const ProjectChatSuggestions: React.FC<ProjectChatSuggestionsProps> = ({ 
  questions, 
  onSelectQuestion,
  compact = false,
  forceShow = false
}) => {
  const isMobile = useIsMobile();
  
  // Hide on mobile unless explicitly forced to show
  if (isMobile && !forceShow) {
    return null;
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2 justify-center max-w-full"}>
      {questions.map((question, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={compact ? "text-xs" : "text-xs sm:text-sm"}
          onClick={() => onSelectQuestion(question)}
        >
          {question.length > 30 ? `${question.substring(0, 30)}...` : question}
        </Button>
      ))}
    </div>
  );
};

export default ProjectChatSuggestions;
