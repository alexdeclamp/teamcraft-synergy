
import React from 'react';
import { MessageSquare } from 'lucide-react';
import ProjectChatSuggestions from './ProjectChatSuggestions';

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
  return (
    <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">Project Assistant</h3>
      <p className="text-muted-foreground mb-4">
        Ask questions about your project or select a suggested question below.
      </p>
      <ProjectChatSuggestions 
        questions={questions} 
        onSelectQuestion={onSelectQuestion}
        forceShow={forceShow}
      />
    </div>
  );
};

export default ProjectChatWelcome;
