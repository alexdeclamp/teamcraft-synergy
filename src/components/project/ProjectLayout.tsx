import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectTabs from '@/components/project/ProjectTabs';

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
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: any[], recent: any[]) => void;
  handleAddMember: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  setActiveTab
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ProjectHeader
        project={project}
        userRole={userRole}
        membersCount={members.length}
        imagesCount={projectImages.length}
        daysSinceCreation={daysSinceCreation()}
        onAddMember={handleAddMember}
      />
      
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
        formatFileSize={formatFileSize}
        handleImagesUpdated={handleImagesUpdated}
        handleAddMember={handleAddMember}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default ProjectLayout;
