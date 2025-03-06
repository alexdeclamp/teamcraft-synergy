
import React from 'react';
import ProjectOverview from '../ProjectOverview';
import RecentImagesCard from '../RecentImagesCard';
import ProjectQuickLinks from '../ProjectQuickLinks';
import { Button } from '@/components/ui/button';

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
        <RecentImagesCard
          recentImages={recentImages}
          totalImagesCount={imageCount}
          isImagesLoading={isImagesLoading}
          formatFileSize={formatFileSize}
          onViewAllImages={() => onTabChange('images')}
        />
        
        <div className="space-y-3">
          <div className="p-6 border border-dashed rounded-md">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Capture ideas and keep track of important information</p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onTabChange('notes')}
                >
                  Create Note
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTabChange('notes')}
                >
                  View Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      <ProjectQuickLinks onTabChange={onTabChange} />
    </div>
  );
};

export default ProjectTabsOverview;
