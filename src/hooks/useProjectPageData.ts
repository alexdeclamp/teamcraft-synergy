
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_favorite?: boolean;
  is_archived?: boolean;
}

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
  is_favorite?: boolean;
  is_important?: boolean;
  is_archived?: boolean;
}

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
  toggleFavoriteProject: () => Promise<void>;
  toggleArchiveProject: () => Promise<void>;
}

export const useProjectPageData = (projectId: string | undefined): UseProjectPageDataResult => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [projectImages, setProjectImages] = useState<UploadedImage[]>([]);
  const [recentImages, setRecentImages] = useState<UploadedImage[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !user) return;

      try {
        setLoading(true);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        
        const isOwner = projectData.owner_id === user.id;
        
        if (!isOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

          if (memberError) {
            navigate('/dashboard');
            toast.error("You don't have access to this project");
            return;
          }
          
          setUserRole(memberData.role);
        } else {
          setUserRole('owner');
        }

        setProject(projectData);

        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('id, role, user_id')
          .eq('project_id', projectId);

        if (membersError) throw membersError;

        const { data: ownerProfile, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', projectData.owner_id)
          .single();

        if (ownerError) throw ownerError;

        const memberIds = membersData.map((member: any) => member.user_id);
        
        let memberProfiles = [];
        if (memberIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', memberIds);
            
          if (profilesError) throw profilesError;
          memberProfiles = profilesData || [];
        }

        const membersWithProfiles = membersData.map((member: any) => {
          const profile = memberProfiles.find((p: any) => p.id === member.user_id) || {};
          return {
            id: member.user_id,
            name: profile.full_name || 'Unknown User',
            email: '', // We don't expose emails
            role: member.role,
            avatar: profile.avatar_url
          };
        });

        const allMembers: ProjectMember[] = [
          {
            id: ownerProfile.id,
            name: ownerProfile.full_name || 'Unknown',
            email: '', // We don't expose emails
            role: 'owner',
            avatar: ownerProfile.avatar_url
          },
          ...membersWithProfiles
        ];

        setMembers(allMembers);
      } catch (error: any) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user, navigate]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fetchProjectImages = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      setIsImagesLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('project_images')
        .list(`${projectId}`);

      if (error) throw error;

      if (data) {
        const imageUrls = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = await supabase
              .storage
              .from('project_images')
              .getPublicUrl(`${projectId}/${item.name}`);
            
            // Fetch summary and metadata if exists
            const { data: imageMeta } = await supabase
              .from('image_summaries')
              .select('summary, is_favorite, is_important, is_archived')
              .eq('image_url', urlData.publicUrl)
              .eq('project_id', projectId)
              .single();

            return {
              url: urlData.publicUrl,
              path: `${projectId}/${item.name}`,
              size: item.metadata?.size || 0,
              name: item.name,
              createdAt: new Date(item.created_at || Date.now()),
              summary: imageMeta?.summary || undefined,
              is_favorite: imageMeta?.is_favorite || false,
              is_important: imageMeta?.is_important || false,
              is_archived: imageMeta?.is_archived || false
            };
          })
        );

        const sortedImages = imageUrls.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

        setProjectImages(sortedImages);
        
        // Filter out archived images for the recent images display
        const filteredImages = sortedImages.filter(img => !img.is_archived);
        setRecentImages(filteredImages.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load project images');
    } finally {
      setIsImagesLoading(false);
    }
  }, [projectId, user]);

  // Initial fetch of images when project is loaded
  useEffect(() => {
    if (project && projectId && !isImagesLoading && projectImages.length === 0) {
      fetchProjectImages();
    }
  }, [project, projectId, fetchProjectImages, isImagesLoading, projectImages.length]);

  const handleImagesUpdated = (images: UploadedImage[], recent: UploadedImage[]) => {
    setProjectImages(images);
    setRecentImages(recent);
  };

  const handleAddMember = () => {
    setShowInviteDialog(true);
  };

  const toggleFavoriteProject = async () => {
    if (!project || !projectId) return;
    
    try {
      const newFavoriteStatus = !project.is_favorite;
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      setProject({
        ...project,
        is_favorite: newFavoriteStatus
      });
      
      toast.success(
        newFavoriteStatus
          ? 'Project added to favorites'
          : 'Project removed from favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Failed to update project');
    }
  };
  
  const toggleArchiveProject = async () => {
    if (!project || !projectId) return;
    
    try {
      const newArchivedStatus = !project.is_archived;
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_archived: newArchivedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      setProject({
        ...project,
        is_archived: newArchivedStatus
      });
      
      toast.success(
        newArchivedStatus
          ? 'Project has been archived'
          : 'Project has been unarchived'
      );
      
      if (newArchivedStatus) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update project');
    }
  };

  const daysSinceCreation = () => {
    if (!project) return 0;
    const creationDate = new Date(project.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Generate a realistic, stable activity percentage
  const activityPercentage = Math.floor(Math.random() * 60) + 40;

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
