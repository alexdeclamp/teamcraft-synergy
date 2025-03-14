
import React from 'react';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';
import TutorialTooltip from './TutorialTooltip';
import { toast } from 'sonner';

interface ProjectTutorialProps {
  activeTab: string;
  className?: string;
  size?: string; // Add size prop to interface
}

const ProjectTutorial: React.FC<ProjectTutorialProps> = ({ 
  activeTab, 
  className,
  size // Destructure the size prop
}) => {
  // Define the tutorial steps based on the active tab
  const getTutorialConfig = (): TutorialConfig => {
    const baseSteps = [
      {
        id: 'overview',
        title: 'Project Overview',
        description: 'Get a quick summary of your project, including stats and important information.',
        targetId: 'tab-overview'
      },
      {
        id: 'notes',
        title: 'Project Notes',
        description: 'Create and organize notes for your project. Use the AI summary feature to get quick overviews of your notes.',
        targetId: 'tab-notes'
      },
      {
        id: 'updates',
        title: 'Project Updates',
        description: 'Share updates with your team members to keep everyone informed about progress.',
        targetId: 'tab-updates'
      },
      {
        id: 'documents',
        title: 'Brain Documents',
        description: 'Upload PDF documents to train your AI brain. You can chat with documents and ask specific questions about their content.',
        targetId: 'tab-documents'
      },
      {
        id: 'images',
        title: 'Project Images',
        description: 'Upload and organize images. Use AI to analyze and generate descriptions of your images automatically.',
        targetId: 'tab-images'
      },
      {
        id: 'members',
        title: 'Team Members',
        description: 'Manage your project team. Invite new members and assign roles.',
        targetId: 'tab-members'
      },
      {
        id: 'chat',
        title: 'Project Chat',
        description: 'Chat with AI about your project. The AI assistant has context from your notes, documents, and images to provide relevant answers.',
        targetId: 'tab-chat'
      },
      {
        id: 'chat-fullscreen',
        title: 'Fullscreen Chat',
        description: 'Use the expand button to open the chat in fullscreen mode for a better chat experience with more space.',
        targetId: 'expand-chat'
      },
      {
        id: 'favorite',
        title: 'Favorite Brains',
        description: 'Mark this brain as a favorite to easily find it later. You can view all your favorite brains by using the favorites filter on the dashboard.',
        targetId: 'favorite-brain'
      }
    ];

    // Add settings if user is owner
    const settingsElement = document.getElementById('tab-settings');
    if (settingsElement) {
      baseSteps.splice(6, 0, {
        id: 'settings',
        title: 'Project Settings',
        description: 'Configure your project settings, including visibility, permissions, and other options.',
        targetId: 'tab-settings'
      });
    }

    return {
      steps: baseSteps,
      onComplete: () => {
        toast.success('Tutorial completed! You now know how to use the project workspace.');
      }
    };
  };

  const tutorialConfig = getTutorialConfig();
  const tutorial = useTutorial(tutorialConfig);

  // Render the tutorial tooltip if active
  return (
    <>
      <TutorialButton onClick={tutorial.startTutorial} className={className} size={size} />
      
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

export default ProjectTutorial;
