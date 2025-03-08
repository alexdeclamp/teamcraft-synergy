
import React from 'react';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';
import TutorialTooltip from './TutorialTooltip';
import { toast } from 'sonner';

interface ChatTutorialProps {
  className?: string;
}

const ChatTutorial: React.FC<ChatTutorialProps> = ({ className }) => {
  // Define the tutorial steps for chat
  const tutorialConfig: TutorialConfig = {
    steps: [
      {
        id: 'chat-intro',
        title: 'Project AI Assistant',
        description: 'This is your AI project assistant that has knowledge of all your project content.',
        targetId: 'project-chat'
      },
      {
        id: 'chat-suggestions',
        title: 'Suggested Questions',
        description: 'Click on these suggestions to quickly ask common questions about your project.',
        targetId: 'chat-suggestions'
      },
      {
        id: 'chat-input',
        title: 'Ask Anything',
        description: 'Type your questions here. The AI assistant has access to your project notes, documents, and images.',
        targetId: 'chat-input'
      },
      {
        id: 'chat-expand',
        title: 'Expand View',
        description: 'Click here to open the chat in fullscreen mode for a better experience.',
        targetId: 'expand-chat'
      },
      {
        id: 'chat-info',
        title: 'Information Used',
        description: 'View what information the AI has access to when answering your questions.',
        targetId: 'chat-info'
      }
    ],
    onComplete: () => {
      toast.success('Chat tutorial completed! You now know how to use the AI assistant effectively.');
    }
  };

  const tutorial = useTutorial(tutorialConfig);

  return (
    <>
      <TutorialButton onClick={tutorial.startTutorial} className={className} />
      
      {tutorial.isActive && tutorial.currentStep && (
        <TutorialTooltip
          step={tutorial.currentStep}
          isFirstStep={tutorial.isFirstStep}
          isLastStep={tutorial.isLastStep}
          onNext={tutorial.nextStep}
          onPrevious={tutorial.previousStep}
          onClose={tutorial.stopTutorial}
        />
      )}
    </>
  );
};

export default ChatTutorial;
