
import React from 'react';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';
import TutorialTooltip from './TutorialTooltip';
import { toast } from 'sonner';

interface SummaryTutorialProps {
  type: 'note' | 'image' | 'document';
  className?: string;
}

const SummaryTutorial: React.FC<SummaryTutorialProps> = ({ type, className }) => {
  // Define the tutorial steps based on summary type
  const getTutorialConfig = (): TutorialConfig => {
    let steps;
    
    if (type === 'note') {
      steps = [
        {
          id: 'note-summary-intro',
          title: 'Note Summaries',
          description: 'Get AI-generated summaries of your notes to quickly understand their content.',
          targetId: 'note-summary-button'
        },
        {
          id: 'note-summary-generate',
          title: 'Generate Summary',
          description: 'Click the summary button to generate an AI summary of your note.',
          targetId: 'note-summary-button'
        },
        {
          id: 'note-summary-view',
          title: 'View Summary',
          description: 'Once generated, you can view the summary by clicking the same button.',
          targetId: 'note-summary-button'
        },
        {
          id: 'note-summary-feedback',
          title: 'Provide Feedback',
          description: 'Let us know if the summary was helpful by rating it.',
          targetId: 'summary-feedback'
        }
      ];
    } else if (type === 'image') {
      steps = [
        {
          id: 'image-summary-intro',
          title: 'Image Descriptions',
          description: 'Get AI-generated descriptions of your images to help with organization and searchability.',
          targetId: 'image-summary-button'
        },
        {
          id: 'image-summary-generate',
          title: 'Generate Description',
          description: 'Click the summary button to have AI analyze and describe your image.',
          targetId: 'image-summary-button'
        },
        {
          id: 'image-tags',
          title: 'Image Tags',
          description: 'Add tags to your images for better organization and filtering capabilities.',
          targetId: 'image-tag-manager'
        }
      ];
    } else { // document
      steps = [
        {
          id: 'document-chat-intro',
          title: 'Document Chat',
          description: 'Chat with your documents to extract information and insights.',
          targetId: 'document-chat-button'
        },
        {
          id: 'document-question',
          title: 'Ask Questions',
          description: 'Ask specific questions about document content to get targeted answers.',
          targetId: 'document-question-button'
        }
      ];
    }

    return {
      steps,
      onComplete: () => {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} summary tutorial completed!`);
      }
    };
  };

  const tutorialConfig = getTutorialConfig();
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

export default SummaryTutorial;
