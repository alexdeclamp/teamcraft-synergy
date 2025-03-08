
import React from 'react';
import ProjectOverview from '../ProjectOverview';
import ProjectQuickLinks from '../ProjectQuickLinks';

interface ProjectTabsOverviewProps {
  project: any;
  members: any[];
  userRole: string | null;
  activityPercentage: number;
  daysSinceCreation: () => number;
  imageCount: number;
  recentImages: any[];
  isImagesLoading: boolean;
  formatFileSize: (bytes: number) => string;
  onAddMember: () => void;
  onTabChange: (tab: string) => void;
}

const ProjectTabsOverview: React.FC<ProjectTabsOverviewProps> = ({
  project,
  members,
  userRole,
  activityPercentage,
  daysSinceCreation,
  imageCount,
  recentImages,
  isImagesLoading,
  formatFileSize,
  onAddMember,
  onTabChange
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
        onAddMember={onAddMember}
        onTabChange={onTabChange}
      />
        
      <ProjectQuickLinks onTabChange={onTabChange} />
    </div>
  );
};

export default ProjectTabsOverview;
