
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProjectQuickUpdate from './ProjectQuickUpdate';
import { useAuth } from '@/contexts/AuthContext';
import ProjectUpdatesHeader from './update/ProjectUpdatesHeader';
import ProjectUpdatesList from './update/ProjectUpdatesList';
import { Update } from './update/types';

interface ProjectUpdatesProps {
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId }) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchUpdates = async () => {
    try {
      const isInitialLoad = isLoading;
      if (!isInitialLoad) setIsRefreshing(true);
      
      const { data: updateData, error } = await supabase
        .from('project_updates')
        .select(`
          id,
          content,
          created_at,
          user_id,
          tags
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (updateData && updateData.length > 0) {
        const userIds = [...new Set(updateData.map(update => update.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        const profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});
        
        const formattedUpdates = updateData.map((update: any) => ({
          id: update.id,
          content: update.content,
          created_at: update.created_at,
          user_id: update.user_id,
          user_name: profilesMap[update.user_id]?.full_name || 'Unknown User',
          user_avatar: profilesMap[update.user_id]?.avatar_url,
          tags: update.tags || []
        }));
        
        setUpdates(formattedUpdates);
      } else {
        setUpdates([]);
      }
    } catch (error: any) {
      console.error('Error fetching updates:', error);
      toast.error(`Failed to load updates: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId)
        .eq('user_id', user?.id); // Ensure only the owner can delete
      
      if (error) throw error;
      
      // Update local state
      setUpdates(updates.filter(update => update.id !== updateId));
      toast.success('Update deleted successfully');
    } catch (error: any) {
      console.error('Error deleting update:', error);
      toast.error(`Failed to delete update: ${error.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchUpdates();
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      <ProjectQuickUpdate 
        projectId={projectId}
        onUpdateAdded={fetchUpdates}
      />
      
      <div>
        <ProjectUpdatesHeader 
          onRefresh={fetchUpdates}
          isRefreshing={isRefreshing}
        />
        
        <ProjectUpdatesList 
          updates={updates}
          isLoading={isLoading}
          userId={user?.id}
          onUpdateRemoved={handleDeleteUpdate}
        />
      </div>
    </div>
  );
};

export default ProjectUpdates;
