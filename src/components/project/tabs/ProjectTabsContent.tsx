import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import ProjectTabsOverview from './ProjectTabsOverview';
import ProjectNotesTab from '../ProjectNotes';
import ProjectUpdatesTab from '../ProjectUpdatesTab';
import ProjectDocumentsTab from '../ProjectDocumentsTab';
import ProjectImages from '../ProjectImages';
import ProjectMembers from '../ProjectMembers';
import ProjectSettings from '../ProjectSettings';
import ProjectChatTab from '../ProjectChatTab';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

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
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: any[], recent?: any[]) => void;
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
  formatFileSize,
  handleImagesUpdated,
  handleAddMember,
  setActiveTab
}) => {
  const onImagesUpdated = (images: UploadedImage[]) => {
    handleImagesUpdated(images);
  };

  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <ProjectTabsOverview 
          project={project}
          members={members}
          userRole={userRole}
          activityPercentage={activityPercentage}
          daysSinceCreation={daysSinceCreation}
          imageCount={projectImages.length}
          recentImages={recentImages}
          isImagesLoading={isImagesLoading}
          formatFileSize={formatFileSize}
          onAddMember={handleAddMember}
          onTabChange={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-6">
        {project && projectId && <ProjectNotesTab projectId={projectId} />}
      </TabsContent>

      <TabsContent value="updates" className="space-y-6">
        {project && projectId && <ProjectUpdatesTab projectId={projectId} />}
      </TabsContent>

      <TabsContent value="documents" className="space-y-6">
        {project && projectId && <ProjectDocumentsTab projectId={projectId} />}
      </TabsContent>
      
      <TabsContent value="images" className="space-y-6">
        {project && projectId && (
          <ProjectImages 
            projectId={projectId} 
            images={projectImages}
            isLoading={isImagesLoading}
            onImagesUpdated={onImagesUpdated}
            onUploadComplete={() => {}}
          />
        )}
      </TabsContent>
      
      <TabsContent value="members" className="space-y-6">
        {project && (
          <ProjectMembers
            projectId={project.id}
            members={members}
            setMembers={setMembers}
            userRole={userRole}
          />
        )}
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-6">
        {project && projectId && <ProjectSettings projectId={projectId} />}
      </TabsContent>
      
      <TabsContent value="chat" className="space-y-6">
        {project && projectId && <ProjectChatTab projectId={projectId} />}
      </TabsContent>
    </>
  );
};

export default ProjectTabsContent;
