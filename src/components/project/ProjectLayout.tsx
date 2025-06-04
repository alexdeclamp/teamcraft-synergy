
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectLayoutLoading from './layout/ProjectLayoutLoading';
import ProjectLayoutError from './layout/ProjectLayoutError';
import ChatCentricLayout from './layout/ChatCentricLayout';

interface ProjectLayoutProps {
  loading: boolean;
  project: any;
  members: any[];
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
  userRole: string | null;
  projectImages: any[];
  recentImages: any[];
  isImagesLoading: boolean;
  daysSinceCreation: () => number;
  activityPercentage: number;
  noteCount: number;
  documentCount: number;
  recentUpdatesCount: number;
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: any[], recent: any[]) => void;
  handleAddMember: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  loading,
  project,
  members,
  setMembers,
  userRole,
  projectImages,
  recentImages,
  isImagesLoading,
  daysSinceCreation,
  activityPercentage,
  noteCount,
  documentCount,
  recentUpdatesCount,
  formatFileSize,
  handleImagesUpdated,
  handleAddMember,
  activeTab,
  setActiveTab,
  showInviteDialog,
  setShowInviteDialog
}) => {
  if (loading) {
    return <ProjectLayoutLoading />;
  }

  if (!project) {
    return <ProjectLayoutError />;
  }

  return (
    <ChatCentricLayout
      project={project}
      members={members}
      setMembers={setMembers}
      userRole={userRole}
      projectImages={projectImages}
      recentImages={recentImages}
      isImagesLoading={isImagesLoading}
      daysSinceCreation={daysSinceCreation}
      activityPercentage={activityPercentage}
      noteCount={noteCount}
      documentCount={documentCount}
      recentUpdatesCount={recentUpdatesCount}
      formatFileSize={formatFileSize}
      handleImagesUpdated={handleImagesUpdated}
      handleAddMember={handleAddMember}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default ProjectLayout;
