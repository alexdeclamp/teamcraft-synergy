
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectTutorial from '@/components/tutorial/ProjectTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';

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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto">
        <TabsTrigger value="overview" id="tab-overview">Overview</TabsTrigger>
        <TabsTrigger value="notes" id="tab-notes">Notes</TabsTrigger>
        <TabsTrigger value="updates" id="tab-updates">Updates</TabsTrigger>
        <TabsTrigger value="documents" id="tab-documents">Documents</TabsTrigger>
        <TabsTrigger value="images" id="tab-images">Images</TabsTrigger>
        <TabsTrigger value="members" id="tab-members">Members</TabsTrigger>
        {userRole === 'owner' && (
          <TabsTrigger value="settings" id="tab-settings">Settings</TabsTrigger>
        )}
      </TabsList>
      
      <div className="flex items-center gap-2">
        <StartOnboardingButton />
        <ProjectTutorial activeTab={activeTab} />
      </div>
    </div>
  );
};

export default ProjectTabsNavigation;
