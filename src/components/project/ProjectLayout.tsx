
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectTabs from '@/components/project/ProjectTabs';
import FloatingChatButton from '@/components/project/chat/FloatingChatButton';
import ProjectChatFullscreen from '@/components/project/chat/ProjectChatFullscreen';
import { useIsMobile } from '@/hooks/use-mobile';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import ProjectTutorial from '@/components/tutorial/ProjectTutorial';

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
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <ProjectHeader
          project={project}
          userRole={userRole}
          membersCount={members.length}
          imagesCount={projectImages.length}
          daysSinceCreation={daysSinceCreation()}
          onAddMember={handleAddMember}
          showInviteDialog={showInviteDialog}
          setShowInviteDialog={setShowInviteDialog}
        />
        
        {isMobile && (
          <div className="flex items-center justify-end gap-2 mb-3">
            <StartOnboardingButton size="sm" />
            <ProjectTutorial activeTab={activeTab} size="sm" />
          </div>
        )}
        
        <ProjectTabs
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
          noteCount={noteCount}
          documentCount={documentCount}
          recentUpdatesCount={recentUpdatesCount}
          formatFileSize={formatFileSize}
          handleImagesUpdated={handleImagesUpdated}
          handleAddMember={handleAddMember}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </main>

      <FloatingChatButton 
        onClick={() => setIsChatOpen(true)} 
        className="shadow-xl" 
      />

      <ProjectChatFullscreen 
        projectId={project.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default ProjectLayout;
