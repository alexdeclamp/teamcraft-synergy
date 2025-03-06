
import React from 'react';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';
import TutorialTooltip from './TutorialTooltip';
import { toast } from 'sonner';

interface DashboardTutorialProps {
  className?: string;
}

const DashboardTutorial: React.FC<DashboardTutorialProps> = ({ className }) => {
  // Define the tutorial steps for the dashboard
  const tutorialConfig: TutorialConfig = {
    steps: [
      {
        id: 'brains-overview',
        title: 'Welcome to Your Brains Dashboard',
        description: 'This is where you can view and manage all your AI brains. Each brain can be trained on different data for specialized knowledge.',
        targetId: 'dashboard-heading'
      },
      {
        id: 'search',
        title: 'Find Your Brains',
        description: 'Use the search bar to quickly find specific brains by name or description.',
        targetId: 'search-brains'
      },
      {
        id: 'filter',
        title: 'Filter Your Brains',
        description: 'Filter your brains by ownership status - see all brains, only those you own, or just the ones where you\'re a team member.',
        targetId: 'filter-brains'
      },
      {
        id: 'sort',
        title: 'Sort Your Brains',
        description: 'Arrange your brains by date created, alphabetically, or other criteria to find what you need faster.',
        targetId: 'sort-brains'
      },
      {
        id: 'brain-card',
        title: 'Brain Cards',
        description: 'Each card represents an AI brain. Click on a card to access its content, settings, and chat functionality.',
        targetId: 'brain-cards'
      },
      {
        id: 'new-brain',
        title: 'Create New Brains',
        description: 'Click here to create a new AI brain that you can train with your documents and knowledge.',
        targetId: 'new-brain-button'
      }
    ],
    onComplete: () => {
      toast.success('Tutorial completed! You now know how to use the dashboard.');
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

export default DashboardTutorial;
