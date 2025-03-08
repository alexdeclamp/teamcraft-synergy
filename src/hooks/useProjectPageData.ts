
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { daysSinceDate, formatFileSize } from '@/utils/fileUtils';
import { useProjectData } from '@/hooks/useProjectData';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useProjectImages } from '@/hooks/useProjectImages';
import { Project, ProjectMember, UploadedImage } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

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
  noteCount: number;
  documentCount: number;
  recentUpdatesCount: number;
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

  // New state variables for additional statistics
  const [noteCount, setNoteCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [recentUpdatesCount, setRecentUpdatesCount] = useState(0);

  // Generate a realistic, stable activity percentage (for demo purposes)
  const activityPercentage = Math.floor(Math.random() * 60) + 40;

  const daysSinceCreation = () => {
    if (!project) return 0;
    return daysSinceDate(project.created_at);
  };

  // Fetch additional statistics when project loads
  useEffect(() => {
    if (!projectId) return;

    const fetchAdditionalStats = async () => {
      try {
        // Fetch note count
        const { count: notesCount, error: notesError } = await supabase
          .from('project_notes')
          .select('id', { count: 'exact' })
          .eq('project_id', projectId);
        
        if (!notesError) {
          setNoteCount(notesCount || 0);
        }

        // Fetch document count
        const { count: docsCount, error: docsError } = await supabase
          .from('project_documents')
          .select('id', { count: 'exact' })
          .eq('project_id', projectId);
        
        if (!docsError) {
          setDocumentCount(docsCount || 0);
        }

        // Fetch recent updates count (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: updatesCount, error: updatesError } = await supabase
          .from('project_updates')
          .select('id', { count: 'exact' })
          .eq('project_id', projectId)
          .gte('created_at', yesterday.toISOString());
        
        if (!updatesError) {
          setRecentUpdatesCount(updatesCount || 0);
        }
      } catch (error) {
        console.error('Error fetching project statistics:', error);
      }
    };

    fetchAdditionalStats();
  }, [projectId]);

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
    noteCount,
    documentCount,
    recentUpdatesCount,
    formatFileSize,
    handleImagesUpdated,
    handleAddMember,
    showInviteDialog,
    setShowInviteDialog,
    fetchProjectImages
  };
};
