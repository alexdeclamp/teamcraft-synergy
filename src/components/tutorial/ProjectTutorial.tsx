
import React from 'react';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';
import TutorialTooltip from './TutorialTooltip';
import { toast } from 'sonner';

interface ProjectTutorialProps {
  activeTab: string;
  className?: string;
}

const ProjectTutorial: React.FC<ProjectTutorialProps> = ({ activeTab, className }) => {
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
        description: 'Create and organize notes for your project. Keep track of ideas and important information.',
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
        description: 'Upload PDF documents to train your AI brain with specialized knowledge.',
        targetId: 'tab-documents'
      },
      {
        id: 'images',
        title: 'Project Images',
        description: 'Upload and organize images related to your project. AI will help analyze and summarize them.',
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
        description: 'Chat with AI about your project. The AI is trained on your project data for context-aware responses.',
        targetId: 'tab-chat'
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

export default ProjectTutorial;
