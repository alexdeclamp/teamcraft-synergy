
import React from 'react';
import { MessageSquare } from 'lucide-react';
import ProjectChatSuggestions from './ProjectChatSuggestions';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectChatWelcomeProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  forceShow?: boolean;
}

const ProjectChatWelcome: React.FC<ProjectChatWelcomeProps> = ({ 
  questions, 
  onSelectQuestion,
  forceShow = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
      <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">Project Assistant</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ask questions about your project {!isMobile && "or select a suggested question below"}
      </p>
      <ProjectChatSuggestions 
        questions={questions} 
        onSelectQuestion={onSelectQuestion}
        forceShow={forceShow}
      />
      {isMobile && !forceShow && (
        <button 
          className="text-xs text-primary mt-2 underline"
          onClick={() => onSelectQuestion("Show me all suggestion options")}
        >
          Show suggestions
        </button>
      )}
    </div>
  );
};

export default ProjectChatWelcome;
