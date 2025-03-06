
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProjectChatSuggestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  compact?: boolean;
}

const ProjectChatSuggestions: React.FC<ProjectChatSuggestionsProps> = ({ 
  questions, 
  onSelectQuestion,
  compact = false
}) => {
  return (
    <div className={compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2 justify-center"}>
      {questions.map((question, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={compact ? "text-xs" : "text-sm"}
          onClick={() => onSelectQuestion(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};

export default ProjectChatSuggestions;
