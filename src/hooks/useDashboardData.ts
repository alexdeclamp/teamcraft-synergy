
import { useState, useEffect } from 'react';
import { ProjectCardProps } from '@/components/project-card/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDashboardDataResult {
  projects: ProjectCardProps[];
  filteredProjects: ProjectCardProps[];
  loading: boolean;
  searchTerm: string;
  filter: 'all' | 'owned' | 'member' | 'favorites';
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  setSearchTerm: (term: string) => void;
  setFilter: (filter: 'all' | 'owned' | 'member' | 'favorites') => void;
  setSortOrder: (order: 'newest' | 'oldest' | 'alphabetical') => void;
}

export const useDashboardData = (): UseDashboardDataResult => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'member' | 'favorites'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            description,
            created_at,
            updated_at,
            owner_id,
            is_favorite
          `)
          .eq('owner_id', user.id);

        if (ownedError) throw ownedError;

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
              is_favorite
            )
          `)
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        const formattedOwnedProjects = ownedProjects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || '',
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          status: 'active' as const,
          memberCount: 1,
          isOwner: true,
          isFavorite: project.is_favorite
        }));

        const memberProjectsMap = new Map();
        memberProjects.forEach(item => {
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
                isFavorite: project.is_favorite
              });
            }
          }
        });

        const formattedMemberProjects = Array.from(memberProjectsMap.values());
        
        const allProjects = [...formattedOwnedProjects, ...formattedMemberProjects];
        
        await Promise.all(allProjects.map(async (project) => {
          const { count, error: countError } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
            
          if (!countError) {
            project.memberCount = (count || 0) + 1;
          }
        }));

        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'owned') return matchesSearch && project.isOwner;
      if (filter === 'member') return matchesSearch && !project.isOwner;
      if (filter === 'favorites') return matchesSearch && project.isFavorite;
      
      return matchesSearch;
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

  return {
    projects,
    filteredProjects,
    loading,
    searchTerm,
    filter,
    sortOrder,
    setSearchTerm,
    setFilter,
    setSortOrder
  };
};
