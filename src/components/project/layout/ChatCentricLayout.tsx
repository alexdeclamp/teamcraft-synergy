
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import ProjectChat from '@/components/ProjectChat';
import ProjectTabsContent from '@/components/project/tabs/ProjectTabsContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minimize2, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatCentricLayoutProps {
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
}

const ChatCentricLayout: React.FC<ChatCentricLayoutProps> = ({
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
  setActiveTab
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        {/* Chat principal - toujours visible */}
        <div className={`${isExpanded ? 'w-full' : isMobile ? 'w-full' : 'w-2/3'} flex flex-col border-r transition-all duration-300`}>
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-lg font-semibold truncate">{project.title}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showSidebar ? 'Masquer' : 'Explorer'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <ProjectChat projectId={project.id} disableAutoScroll={false} />
          </div>
        </div>

        {/* Sidebar contextuel - caché par défaut sur mobile */}
        {(!isMobile && (showSidebar || activeTab !== 'overview')) && !isExpanded && (
          <div className="w-1/3 flex flex-col bg-muted/20">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Contexte du projet
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
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
          </div>
        )}
      </div>

      {/* Mobile overlay pour les contenus */}
      {isMobile && activeTab !== 'overview' && (
        <div className="fixed inset-0 bg-background z-50 pt-16">
          <div className="p-4 border-b flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au chat
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
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
        </div>
      )}
    </div>
  );
};

export default ChatCentricLayout;
