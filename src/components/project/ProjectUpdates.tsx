
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ProjectQuickUpdate from './ProjectQuickUpdate';

interface Update {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
}

interface ProjectUpdatesProps {
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId }) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUpdates = async () => {
    try {
      const isInitialLoad = isLoading;
      if (!isInitialLoad) setIsRefreshing(true);
      
      // Get project updates - using a different approach that doesn't rely on direct table relationships
      const { data: updateData, error } = await supabase
        .from('project_updates')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If we have updates, fetch the corresponding user profiles separately
      if (updateData && updateData.length > 0) {
        // Get unique user IDs from updates
        const userIds = [...new Set(updateData.map(update => update.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Create a map of user_id to profile data for easier lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {});
        
        // Join the data manually
        const formattedUpdates = updateData.map((update: any) => ({
          id: update.id,
          content: update.content,
          created_at: update.created_at,
          user_id: update.user_id,
          user_name: profilesMap[update.user_id]?.full_name || 'Unknown User',
          user_avatar: profilesMap[update.user_id]?.avatar_url
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

  useEffect(() => {
    if (projectId) {
      fetchUpdates();
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Project Updates</CardTitle>
          <CardDescription>
            Share quick status updates with your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProjectQuickUpdate 
            projectId={projectId}
            onUpdateAdded={fetchUpdates}
          />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Updates</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchUpdates}
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-md">
                <p>No updates yet</p>
                <p className="text-sm mt-1">Be the first to share an update</p>
              </div>
            ) : (
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id}>
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          {update.user_avatar ? (
                            <AvatarImage src={update.user_avatar} alt={update.user_name} />
                          ) : (
                            <AvatarFallback>
                              {update.user_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{update.user_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-line">{update.content}</p>
                        </div>
                      </div>
                      {index < updates.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectUpdates;
