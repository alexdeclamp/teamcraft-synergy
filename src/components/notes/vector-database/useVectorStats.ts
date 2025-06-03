
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VectorStats } from './types';

export function useVectorStats(projectId?: string) {
  const [stats, setStats] = useState<VectorStats | null>(null);

  const fetchVectorStats = useCallback(async () => {
    try {
      console.log('Fetching vector stats for projectId:', projectId);
      
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

      if (error) {
        console.error('Error fetching vector stats:', error);
        throw error;
      }

      console.log('Fetched notes data:', data);

      const totalNotes = data?.length || 0;
      const embeddedNotes = data?.filter(note => {
        if (!note.embedding) return false;
        if (typeof note.embedding === 'string') {
          return note.embedding.trim() !== '';
        }
        if (Array.isArray(note.embedding)) {
          return note.embedding.length > 0;
        }
        return false;
      }).length || 0;

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
        
        const hasEmbedding = note.embedding && (
          typeof note.embedding === 'string' 
            ? note.embedding.trim() !== '' 
            : Array.isArray(note.embedding) && note.embedding.length > 0
        );
        
        if (hasEmbedding) {
          project.embeddedNotes++;
        }
        
        project.percentage = project.totalNotes > 0 
          ? Math.round((project.embeddedNotes / project.totalNotes) * 100)
          : 0;
      });

      const newStats = {
        totalNotes,
        embeddedNotes,
        embeddingPercentage: totalNotes > 0 ? Math.round((embeddedNotes / totalNotes) * 100) : 0,
        projectBreakdown: Array.from(projectMap.values())
      };

      console.log('Calculated stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching vector stats:', error);
      toast.error('Failed to fetch vector statistics');
      // Set empty stats on error to prevent white screen
      setStats({
        totalNotes: 0,
        embeddedNotes: 0,
        embeddingPercentage: 0,
        projectBreakdown: []
      });
    }
  }, [projectId]);

  return {
    stats,
    fetchVectorStats
  };
}
