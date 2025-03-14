
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectTutorial from '@/components/tutorial/ProjectTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectTabsNavigationProps {
  activeTab: string;
  userRole: string | null;
  onTabChange: (tab: string) => void;
}

const ProjectTabsNavigation: React.FC<ProjectTabsNavigationProps> = ({
  activeTab,
  userRole,
  onTabChange
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <ScrollArea className="w-full" type="scroll">
        <TabsList className="bg-muted/50 w-full sm:w-auto inline-flex overflow-auto whitespace-nowrap">
          <TabsTrigger value="overview" id="tab-overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="notes" id="tab-notes" className="text-sm">Notes</TabsTrigger>
          <TabsTrigger value="updates" id="tab-updates" className="text-sm">Updates</TabsTrigger>
          <TabsTrigger value="documents" id="tab-documents" className="text-sm">Docs</TabsTrigger>
          <TabsTrigger value="images" id="tab-images" className="text-sm">Images</TabsTrigger>
          <TabsTrigger value="members" id="tab-members" className="text-sm">Members</TabsTrigger>
          {userRole === 'owner' && (
            <TabsTrigger value="settings" id="tab-settings" className="text-sm">Settings</TabsTrigger>
          )}
        </TabsList>
      </ScrollArea>
      
      {!isMobile && (
        <div className="flex items-center gap-2">
          <StartOnboardingButton />
          <ProjectTutorial activeTab={activeTab} />
        </div>
      )}
    </div>
  );
};

export default ProjectTabsNavigation;
