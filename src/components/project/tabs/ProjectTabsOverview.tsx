
import React from 'react';
import ProjectOverview from '../ProjectOverview';

interface ProjectTabsOverviewProps {
  project: any;
  members: any[];
  userRole: string | null;
  activityPercentage: number;
  daysSinceCreation: () => number;
  imageCount: number;
  noteCount: number;
  documentCount: number;
  recentUpdatesCount: number;
  recentImages: any[];
  isImagesLoading: boolean;
  formatFileSize: (bytes: number) => string;
  onAddMember: () => void;
  onTabChange: (tab: string) => void;
  projectId: string;
}

const ProjectTabsOverview: React.FC<ProjectTabsOverviewProps> = ({
  project,
  members,
  userRole,
  activityPercentage,
  daysSinceCreation,
  imageCount,
  noteCount,
  documentCount,
  recentUpdatesCount,
  recentImages,
  isImagesLoading,
  formatFileSize,
  onAddMember,
  onTabChange,
  projectId
}) => {
  return (
    <div className="space-y-6">
      <ProjectOverview 
        project={project}
        members={members}
        userRole={userRole}
        activityPercentage={activityPercentage}
        daysSinceCreation={daysSinceCreation()}
        imageCount={imageCount}
        noteCount={noteCount}
        documentCount={documentCount}
        recentUpdatesCount={recentUpdatesCount}
        onAddMember={onAddMember}
        onTabChange={onTabChange}
      />
    </div>
  );
};

export default ProjectTabsOverview;
