
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateActivityPercentage } from '@/utils/projectUtils';

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

interface UseProjectMetadataResult {
  loading: boolean;
  project: Project | null;
  userRole: string | null;
  activityPercentage: number;
  toggleFavoriteProject: () => Promise<void>;
  toggleArchiveProject: () => Promise<void>;
}

export const useProjectMetadata = (
  projectId: string | undefined, 
  userId: string | null
): UseProjectMetadataResult => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !userId) return;

      try {
        setLoading(true);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        
        const isOwner = projectData.owner_id === userId;
        
        if (!isOwner) {
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', userId)
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
      } catch (error: any) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, userId, navigate]);

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

  // Activity percentage is generated once per component mount
  const activityPercentage = generateActivityPercentage();

  return {
    loading,
    project,
    userRole,
    activityPercentage,
    toggleFavoriteProject,
    toggleArchiveProject
  };
};
