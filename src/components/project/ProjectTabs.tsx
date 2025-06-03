
import React from 'react';
import ProjectTabsContent from './tabs/ProjectTabsContent';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

interface ProjectTabsProps {
  projectId: string;
  project: any;
  members: ProjectMember[];
  setMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  userRole: string | null;
  projectImages: UploadedImage[];
  recentImages: UploadedImage[];
  isImagesLoading: boolean;
  daysSinceCreation: () => number;
  activityPercentage: number;
  noteCount: number;
  documentCount: number;
  recentUpdatesCount: number;
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: UploadedImage[], recent: UploadedImage[]) => void;
  handleAddMember: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({
  projectId,
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
  setActiveTab
}) => {
  return (
    <ProjectTabsContent
      activeTab={activeTab}
      projectId={projectId}
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
      setActiveTab={setActiveTab}
    />
  );
};

export default ProjectTabs;
