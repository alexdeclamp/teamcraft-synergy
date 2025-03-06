
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ProjectHeader from './ProjectHeader';
import ProjectOverview from './ProjectOverview';
import ProjectTabs from './ProjectTabs';
import ProjectNotesTab from './ProjectNotes';
import ProjectImagesTab from './ProjectImagesTab';
import ProjectChatTab from './ProjectChatTab';
import ProjectDocumentsTab from './ProjectDocumentsTab';
import ProjectUpdatesTab from './ProjectUpdatesTab';
import ProjectSettings from './ProjectSettings';
import MemberInvite from '@/components/MemberInvite';

interface ProjectLayoutProps {
  loading: boolean;
  project: any | null;
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
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  showInviteDialog: boolean;
  setShowInviteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFavoriteProject: () => Promise<void>;
  toggleArchiveProject: () => Promise<void>;
  fetchProjectImages: () => Promise<void>;
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
  formatFileSize,
  handleImagesUpdated,
  handleAddMember,
  activeTab,
  setActiveTab,
  showInviteDialog,
  setShowInviteDialog,
  toggleFavoriteProject,
  toggleArchiveProject,
  fetchProjectImages
}) => {
  const [hasNewContent, setHasNewContent] = useState(false);

  // When a member is added, update the list
  const handleInviteSuccess = () => {
    // This would ideally refetch the members
    setHasNewContent(true);
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 space-y-6">
      <ProjectHeader
        project={project}
        userRole={userRole}
        membersCount={members.length}
        imagesCount={projectImages.length}
        daysSinceCreation={daysSinceCreation()}
        onAddMember={handleAddMember}
        showInviteDialog={showInviteDialog}
        setShowInviteDialog={setShowInviteDialog}
        onFavoriteToggle={toggleFavoriteProject}
        onArchiveToggle={toggleArchiveProject}
        onInviteSuccess={handleInviteSuccess}
      />

      <ProjectTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectId={project.id}
        project={project}
        members={members}
        setMembers={setMembers}
        userRole={userRole}
        projectImages={projectImages}
        recentImages={recentImages}
        isImagesLoading={isImagesLoading}
        daysSinceCreation={daysSinceCreation}
        activityPercentage={activityPercentage}
        formatFileSize={formatFileSize}
        handleImagesUpdated={handleImagesUpdated}
        handleAddMember={handleAddMember}
      />

      {activeTab === 'overview' && (
        <ProjectOverview
          project={project}
          members={members}
          recentImages={recentImages}
          activityPercentage={activityPercentage}
          daysSinceCreation={daysSinceCreation()}
          imageCount={projectImages.length}
          handleAddMember={handleAddMember}
          projectId={project.id}
          userRole={userRole}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === 'notes' && (
        <ProjectNotesTab
          projectId={project.id}
        />
      )}

      {activeTab === 'images' && (
        <ProjectImagesTab
          projectId={project.id}
          images={projectImages}
          isLoading={isImagesLoading}
          onImagesUpdated={handleImagesUpdated}
          onUploadComplete={fetchProjectImages}
        />
      )}

      {activeTab === 'chat' && (
        <ProjectChatTab
          projectId={project.id}
        />
      )}

      {activeTab === 'documents' && (
        <ProjectDocumentsTab
          projectId={project.id}
        />
      )}

      {activeTab === 'updates' && (
        <ProjectUpdatesTab
          projectId={project.id}
        />
      )}

      {activeTab === 'settings' && (
        <ProjectSettings
          projectId={project.id}
          project={project}
          members={members}
          setMembers={setMembers}
          userRole={userRole}
        />
      )}

      {/* Invite Modal */}
      <MemberInvite
        projectId={project.id}
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default ProjectLayout;
