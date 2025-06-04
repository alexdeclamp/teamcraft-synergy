
import React from 'react';
import Navbar from '@/components/Navbar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectTabsContent from '@/components/project/tabs/ProjectTabsContent';
import FloatingChatButton from '@/components/project/chat/FloatingChatButton';
import ProjectChatFullscreen from '@/components/project/chat/ProjectChatFullscreen';

interface DesktopProjectLayoutProps {
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
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const DesktopProjectLayout: React.FC<DesktopProjectLayoutProps> = ({
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
  isChatOpen,
  setIsChatOpen
}) => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      
      <div className="pt-16">
        <SidebarProvider>
          <div className="flex w-full min-h-[calc(100vh-4rem)]">
            <div className="relative pt-0">
              <ProjectSidebar 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userRole={userRole}
                projectTitle={project.title}
              />
            </div>
            
            <SidebarInset className="flex-1">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <SidebarTrigger />
                </div>
                
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
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>

      <FloatingChatButton 
        onClick={() => setIsChatOpen(true)} 
        className="shadow-xl" 
        isMobile={false}
      />

      <ProjectChatFullscreen 
        projectId={project.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default DesktopProjectLayout;
