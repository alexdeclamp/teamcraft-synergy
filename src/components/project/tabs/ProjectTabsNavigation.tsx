
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
    <div className="flex justify-between items-center mb-2">
      <TabsList className="bg-muted/50">
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
      
      <div className="flex items-center space-x-2">
        <StartOnboardingButton className="mr-2" />
        <ProjectTutorial activeTab={activeTab} />
      </div>
    </div>
  );
};

export default ProjectTabsNavigation;
