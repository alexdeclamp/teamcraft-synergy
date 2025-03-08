
import React from 'react';
import ProjectOverview from '../ProjectOverview';
import ProjectQuickLinks from '../ProjectQuickLinks';
import ProjectQuickUpdate from '../ProjectQuickUpdate';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Update</CardTitle>
          </CardHeader>
          <div className="p-4">
            {project && project.id && (
              <ProjectQuickUpdate 
                projectId={project.id} 
                onUpdateAdded={() => {}} 
              />
            )}
          </div>
        </Card>
      </div>
        
      <ProjectQuickLinks onTabChange={onTabChange} />
    </div>
  );
};

export default ProjectTabsOverview;
