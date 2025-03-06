
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
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
      
      const { data, error } = await supabase
        .from('project_updates')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setUpdates(data as Update[]);
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

  const handleUpdateAdded = (newUpdate: Update) => {
    setUpdates(prev => [newUpdate, ...prev]);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <ProjectQuickUpdate 
        projectId={projectId} 
        onUpdateAdded={handleUpdateAdded}
      />
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>
              Latest activity from the project team
            </CardDescription>
          </div>
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No updates yet</p>
              <p className="text-sm mt-1">Be the first to share an update!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={update.id}>
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        {update.profiles.avatar_url ? (
                          <AvatarImage src={update.profiles.avatar_url} />
                        ) : null}
                        <AvatarFallback>
                          {getInitials(update.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="font-medium">
                            {update.profiles.full_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-line">{update.content}</p>
                      </div>
                    </div>
                    {index < updates.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectUpdates;
