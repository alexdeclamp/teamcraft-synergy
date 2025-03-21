
import { useState, useEffect, useCallback } from 'react';
import { ProjectCardProps } from '@/components/project-card/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDashboardDataResult {
  projects: ProjectCardProps[];
  filteredProjects: ProjectCardProps[];
  loading: boolean;
  searchTerm: string;
  filter: 'all' | 'owned' | 'member' | 'favorites' | 'archived';
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  setSearchTerm: (term: string) => void;
  setFilter: (filter: 'all' | 'owned' | 'member' | 'favorites' | 'archived') => void;
  setSortOrder: (order: 'newest' | 'oldest' | 'alphabetical') => void;
  refreshProjects: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataResult => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'member' | 'favorites' | 'archived'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchProjects = useCallback(async () => {
    if (!user) {
      console.log('No user, skipping project fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching projects for user:', user.id);
      setLoading(true);
      setError(null);
      
      // Fetch owned projects
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          owner_id,
          is_favorite,
          is_archived
        `)
        .eq('owner_id', user.id);

      if (ownedError) {
        console.error('Error fetching owned projects:', ownedError);
        throw ownedError;
      }

      console.log('Owned projects fetched:', ownedProjects?.length || 0);

      // Fetch projects where user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          projects (
            id,
            title,
            description,
            created_at,
            updated_at,
            owner_id,
            is_favorite,
            is_archived
          )
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching member projects:', memberError);
        throw memberError;
      }

      console.log('Member projects fetched:', memberProjects?.length || 0);
      
      // Safety check for unexpected data formats
      if (!Array.isArray(ownedProjects)) {
        console.error('Owned projects is not an array:', ownedProjects);
        setProjects([]);
        return;
      }

      if (!Array.isArray(memberProjects)) {
        console.error('Member projects is not an array:', memberProjects);
        // Continue with only owned projects
        const formattedOwnedProjects = formatOwnedProjects(ownedProjects, user.id);
        setProjects(formattedOwnedProjects);
        return;
      }

      // Format owned projects
      const formattedOwnedProjects = formatOwnedProjects(ownedProjects, user.id);

      // Process member projects
      const memberProjectsMap = new Map();
      (memberProjects || []).forEach(item => {
        if (item.projects && item.project_id) {
          const project = item.projects;
          if (project.owner_id !== user.id) {
            memberProjectsMap.set(project.id, {
              id: project.id,
              title: project.title,
              description: project.description || '',
              createdAt: project.created_at,
              updatedAt: project.updated_at,
              status: 'active' as const,
              memberCount: 1,
              isOwner: false,
              role: item.role,
              isFavorite: project.is_favorite,
              isArchived: project.is_archived
            });
          }
        }
      });

      const formattedMemberProjects = Array.from(memberProjectsMap.values());
      
      const allProjects = [...formattedOwnedProjects, ...formattedMemberProjects];
      console.log('Total projects after combining:', allProjects.length);
      
      // Fetch member counts for all projects
      await Promise.all(allProjects.map(async (project) => {
        try {
          const { count, error: countError } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
            
          if (!countError) {
            project.memberCount = (count || 0) + 1;
          }
        } catch (error) {
          console.error(`Error fetching member count for project ${project.id}:`, error);
        }
      }));

      setProjects(allProjects);
      setLastRefresh(Date.now());
      console.log('Projects state updated with', allProjects.length, 'projects');
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error as Error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Helper function to format owned projects
  const formatOwnedProjects = (ownedProjects: any[], userId: string): ProjectCardProps[] => {
    return (ownedProjects || []).map(project => ({
      id: project.id,
      title: project.title,
      description: project.description || '',
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      status: 'active' as const,
      memberCount: 1,
      isOwner: true,
      role: 'owner' as const,
      isFavorite: project.is_favorite,
      isArchived: project.is_archived
    }));
  };

  // Fetch projects when user changes or lastRefresh is updated
  useEffect(() => {
    if (user) {
      console.log('User or refresh trigger changed, fetching projects');
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, fetchProjects, lastRefresh]);

  // Apply filters and sorting
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch && !project.isArchived;
      if (filter === 'owned') return matchesSearch && project.isOwner && !project.isArchived;
      if (filter === 'member') return matchesSearch && !project.isOwner && !project.isArchived;
      if (filter === 'favorites') return matchesSearch && project.isFavorite && !project.isArchived;
      if (filter === 'archived') return matchesSearch && project.isArchived;
      
      return matchesSearch && !project.isArchived;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  // Manual refresh function to be called from outside
  const manualRefresh = useCallback(async () => {
    console.log('Manual refresh requested');
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    filteredProjects,
    loading,
    searchTerm,
    filter,
    sortOrder,
    setSearchTerm,
    setFilter,
    setSortOrder,
    refreshProjects: manualRefresh
  };
};
