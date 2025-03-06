import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import ProjectOverview from './ProjectOverview';
import ProjectNotesTab from './ProjectNotes';
import ProjectUpdatesTab from './ProjectUpdatesTab';
import ProjectDocumentsTab from './ProjectDocumentsTab';
import ProjectImages from './ProjectImages';
import ProjectMembers from './ProjectMembers';
import ProjectSettings from './ProjectSettings';
import ProjectChatTab from './ProjectChatTab';
import RecentImagesCard from './RecentImagesCard';
import ProjectQuickLinks from './ProjectQuickLinks';

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
  formatFileSize,
  handleImagesUpdated,
  handleAddMember,
  activeTab,
  setActiveTab
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
      
      <TabsContent value="overview" className="space-y-6">
        <ProjectOverview 
          project={project}
          members={members}
          userRole={userRole}
          activityPercentage={activityPercentage}
          daysSinceCreation={daysSinceCreation()}
          imageCount={projectImages.length}
          onAddMember={handleAddMember}
          onTabChange={setActiveTab}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <RecentImagesCard
            recentImages={recentImages}
            totalImagesCount={projectImages.length}
            isImagesLoading={isImagesLoading}
            formatFileSize={formatFileSize}
            onViewAllImages={() => setActiveTab('images')}
          />
          
          <div className="space-y-3">
            <div className="p-6 border border-dashed rounded-md">
              <div className="text-center">
                <span className="text-3xl mb-2 block">📝</span>
                <p className="text-muted-foreground mb-2">Capture ideas and keep track of important information</p>
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setActiveTab('notes')}
                  >
                    Create Note
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('notes')}
                  >
                    View Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
          
        <ProjectQuickLinks onTabChange={setActiveTab} />
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
            onImagesUpdated={handleImagesUpdated}
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
    </Tabs>
  );
};

export default ProjectTabs;
