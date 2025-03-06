
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <TabsList className="bg-muted/50">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="notes">Notes</TabsTrigger>
      <TabsTrigger value="updates">Updates</TabsTrigger>
      <TabsTrigger value="documents">Documents</TabsTrigger>
      <TabsTrigger value="images">Images</TabsTrigger>
      <TabsTrigger value="members">Members</TabsTrigger>
      {userRole === 'owner' && (
        <TabsTrigger value="settings">Settings</TabsTrigger>
      )}
      <TabsTrigger value="chat">Project Chat</TabsTrigger>
    </TabsList>
  );
};

export default ProjectTabsNavigation;
