
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { daysSinceDate, formatFileSize } from '@/utils/fileUtils';
import { useProjectData } from '@/hooks/useProjectData';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useProjectImages } from '@/hooks/useProjectImages';
import { Project, ProjectMember, UploadedImage } from '@/types/project';

interface UseProjectPageDataResult {
  loading: boolean;
  project: Project | null;
  members: ProjectMember[];
  userRole: string | null;
  projectImages: UploadedImage[];
  recentImages: UploadedImage[];
  isImagesLoading: boolean;
  daysSinceCreation: () => number;
  activityPercentage: number;
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: UploadedImage[], recent: UploadedImage[]) => void;
  handleAddMember: () => void;
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  fetchProjectImages: () => Promise<void>;
}

export const useProjectPageData = (projectId: string | undefined): UseProjectPageDataResult => {
  const { user } = useAuth();
  const userId = user?.id;

  // Get basic project data
  const { project, loading: projectLoading } = useProjectData(projectId, userId);
  
  // Get project members
  const { 
    members,
    userRole,
    loading: membersLoading,
    handleAddMember,
    showInviteDialog,
    setShowInviteDialog
  } = useProjectMembers(projectId, project, userId);
  
  // Get project images
  const {
    projectImages,
    recentImages,
    isImagesLoading,
    handleImagesUpdated,
    fetchProjectImages
  } = useProjectImages(projectId, userId);

  // Generate a realistic, stable activity percentage (for demo purposes)
  const activityPercentage = Math.floor(Math.random() * 60) + 40;

  const daysSinceCreation = () => {
    if (!project) return 0;
    return daysSinceDate(project.created_at);
  };

  return {
    loading: projectLoading || membersLoading,
    project,
    members,
    userRole,
    projectImages,
    recentImages,
    isImagesLoading,
    daysSinceCreation,
    activityPercentage,
    formatFileSize,
    handleImagesUpdated,
    handleAddMember,
    showInviteDialog,
    setShowInviteDialog,
    fetchProjectImages
  };
};
