
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotionProjects = () => {
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchUserProjects = async () => {
    if (!user) return;
    
    try {
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);
        
      if (ownedError) {
        console.error("Error fetching owned projects:", ownedError);
        toast.error("Failed to load projects");
      }
      
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('project_id, projects:project_id(*)')
        .eq('user_id', user.id);
        
      if (memberError) {
        console.error("Error fetching member projects:", memberError);
      }
      
      let allProjects = ownedProjects || [];
      
      if (memberProjects) {
        const memberProjectsData = memberProjects
          .filter(item => item.projects)
          .map(item => item.projects)
          .filter(project => !allProjects.some(p => p.id === project.id));
          
        allProjects = [...allProjects, ...memberProjectsData];
      }
      
      setUserProjects(allProjects);
      
      if (allProjects.length === 1 && !selectedProject) {
        setSelectedProject(allProjects[0].id);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserProjects();
  }, [user]);
  
  return {
    userProjects,
    selectedProject,
    setSelectedProject,
    fetchUserProjects,
    isLoading
  };
};

export default useNotionProjects;
