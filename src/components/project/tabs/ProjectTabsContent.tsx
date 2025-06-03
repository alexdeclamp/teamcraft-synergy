
import React from 'react';
import ProjectTabsOverview from './ProjectTabsOverview';
import ProjectNotesTab from '../ProjectNotes';
import ProjectUpdatesTab from '../ProjectUpdatesTab';
import ProjectDocumentsTab from '../ProjectDocumentsTab';
import ProjectImages from '../ProjectImages';
import ProjectMembers from '../ProjectMembers';
import ProjectSettings from '../ProjectSettings';

interface ProjectTabsContentProps {
  activeTab: string;
  projectId: string;
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
  setActiveTab: (tab: string) => void;
}

const ProjectTabsContent: React.FC<ProjectTabsContentProps> = ({
  activeTab,
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
  setActiveTab
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <ProjectTabsOverview 
              project={project}
              members={members}
              userRole={userRole}
              activityPercentage={activityPercentage}
              daysSinceCreation={daysSinceCreation}
              imageCount={projectImages.length}
              noteCount={noteCount}
              documentCount={documentCount}
              recentUpdatesCount={recentUpdatesCount}
              recentImages={recentImages}
              isImagesLoading={isImagesLoading}
              formatFileSize={formatFileSize}
              onAddMember={handleAddMember}
              onTabChange={setActiveTab}
              projectId={projectId}
            />
          </div>
        );
      
      case 'notes':
        return (
          <div className="space-y-6">
            {project && projectId && <ProjectNotesTab projectId={projectId} />}
          </div>
        );
      
      case 'updates':
        return (
          <div className="space-y-6">
            {project && projectId && <ProjectUpdatesTab projectId={projectId} />}
          </div>
        );
      
      case 'documents':
        return (
          <div className="space-y-6">
            {project && projectId && <ProjectDocumentsTab projectId={projectId} userRole={userRole} />}
          </div>
        );
      
      case 'images':
        return (
          <div className="space-y-6">
            {project && projectId && (
              <ProjectImages 
                projectId={projectId} 
                onImagesUpdated={handleImagesUpdated}
              />
            )}
          </div>
        );
      
      case 'members':
        return (
          <div className="space-y-6">
            {project && (
              <ProjectMembers
                projectId={project.id}
                userRole={userRole}
              />
            )}
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            {project && projectId && <ProjectSettings projectId={projectId} />}
          </div>
        );
      
      default:
        return null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default ProjectTabsContent;
