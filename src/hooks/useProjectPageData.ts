
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectMetadata } from './useProjectMetadata';
import { useProjectMembers } from './useProjectMembers';
import { useProjectImagesData } from './useProjectImagesData';
import { calculateDaysSinceCreation, formatFileSize } from '@/utils/projectUtils';

interface UseProjectPageDataResult {
  loading: boolean;
  project: any | null;
  members: any[];
  userRole: string | null;
  projectImages: any[];
  recentImages: any[];
  isImagesLoading: boolean;
  daysSinceCreation: () => number;
  activityPercentage: number;
  formatFileSize: (bytes: number) => string;
  handleImagesUpdated: (images: any[], recent: any[]) => void;
  handleAddMember: () => void;
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  fetchProjectImages: () => Promise<void>;
  toggleFavoriteProject: () => Promise<void>;
  toggleArchiveProject: () => Promise<void>;
}

export const useProjectPageData = (projectId: string | undefined): UseProjectPageDataResult => {
  const { user } = useAuth();
  
  // Get project metadata
  const { 
    loading, 
    project, 
    userRole, 
    activityPercentage,
    toggleFavoriteProject,
    toggleArchiveProject
  } = useProjectMetadata(projectId, user?.id);
  
  // Get project members
  const {
    members,
    showInviteDialog,
    setShowInviteDialog,
    handleAddMember
  } = useProjectMembers(projectId, project);
  
  // Get project images
  const {
    projectImages,
    recentImages,
    isImagesLoading,
    handleImagesUpdated,
    fetchProjectImages
  } = useProjectImagesData(projectId, user?.id);
  
  // Initialize images when project is loaded
  useEffect(() => {
    if (project && projectId && !isImagesLoading && projectImages.length === 0) {
      fetchProjectImages();
    }
  }, [project, projectId, fetchProjectImages, isImagesLoading, projectImages.length]);
  
  // Calculate days since project creation
  const daysSinceCreation = () => {
    if (!project) return 0;
    return calculateDaysSinceCreation(project.created_at);
  };

  return {
    loading,
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
    fetchProjectImages,
    toggleFavoriteProject,
    toggleArchiveProject
  };
};
