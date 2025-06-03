
import React from 'react';
import Navbar from '@/components/Navbar';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectTabsContent from '@/components/project/tabs/ProjectTabsContent';
import FloatingChatButton from '@/components/project/chat/FloatingChatButton';
import ProjectChatFullscreen from '@/components/project/chat/ProjectChatFullscreen';
import MobileBottomNav from '@/components/project/navigation/MobileBottomNav';
import MobileMoreMenu from '@/components/project/navigation/MobileMoreMenu';

interface MobileProjectLayoutProps {
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
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const MobileProjectLayout: React.FC<MobileProjectLayoutProps> = ({
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
  setShowInviteDialog,
  isChatOpen,
  setIsChatOpen
}) => {
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
        
        <ProjectTabsContent
          activeTab={activeTab}
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
          setActiveTab={setActiveTab}
        />
      </main>

      <div className="pb-16"></div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex bg-background border-t">
        <div className="flex-1">
          <MobileBottomNav 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={userRole}
          />
        </div>
        <div className="border-l flex items-end">
          <MobileMoreMenu
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={userRole}
          />
        </div>
      </div>

      <FloatingChatButton 
        onClick={() => setIsChatOpen(true)} 
        className="shadow-xl" 
        isMobile={true}
      />

      <ProjectChatFullscreen 
        projectId={project.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default MobileProjectLayout;
