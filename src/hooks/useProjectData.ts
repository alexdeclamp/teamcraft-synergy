
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { toast } from 'sonner';

interface UseProjectDataResult {
  project: Project | null;
  loading: boolean;
}

export const useProjectData = (
  projectId: string | undefined,
  userId: string | undefined
): UseProjectDataResult => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !userId) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          throw error;
        }

        setProject(data);
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project data");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, userId, navigate]);

  return { project, loading };
};
