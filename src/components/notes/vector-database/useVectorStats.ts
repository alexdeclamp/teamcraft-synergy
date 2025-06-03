
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VectorStats } from './types';

export function useVectorStats(projectId?: string) {
  const [stats, setStats] = useState<VectorStats | null>(null);

  const fetchVectorStats = useCallback(async () => {
    try {
      let query = supabase
        .from('project_notes')
        .select(`
          id,
          project_id,
          embedding,
          projects!inner(id, title)
        `);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalNotes = data?.length || 0;
      const embeddedNotes = data?.filter(note => 
        note.embedding != null && note.embedding !== ''
      ).length || 0;

      // Group by project
      const projectMap = new Map();
      data?.forEach(note => {
        const projectId = note.project_id;
        const projectTitle = note.projects?.title || 'Unknown Project';
        
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            projectId,
            projectTitle,
            totalNotes: 0,
            embeddedNotes: 0,
            percentage: 0
          });
        }
        
        const project = projectMap.get(projectId);
        project.totalNotes++;
        
        if (note.embedding != null && note.embedding !== '') {
          project.embeddedNotes++;
        }
        
        project.percentage = project.totalNotes > 0 
          ? Math.round((project.embeddedNotes / project.totalNotes) * 100)
          : 0;
      });

      setStats({
        totalNotes,
        embeddedNotes,
        embeddingPercentage: totalNotes > 0 ? Math.round((embeddedNotes / totalNotes) * 100) : 0,
        projectBreakdown: Array.from(projectMap.values())
      });
    } catch (error) {
      console.error('Error fetching vector stats:', error);
      toast.error('Failed to fetch vector statistics');
    }
  }, [projectId]);

  return {
    stats,
    fetchVectorStats
  };
}
