
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, X, Tag, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ProjectQuickUpdate from './ProjectQuickUpdate';
import { useAuth } from '@/contexts/AuthContext';

interface Update {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  tags?: string[];
}

interface ProjectUpdatesProps {
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId }) => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
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
        
        const profilesMap = (profilesData || []).reduce((map, profile) => {
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

  const handleAddTag = async (updateId: string) => {
    if (!tagInput.trim()) return;
    
    try {
      const update = updates.find(u => u.id === updateId);
      if (!update) return;
      
      const currentTags = update.tags || [];
      const newTag = tagInput.trim();
      
      // Don't add duplicate tags
      if (currentTags.includes(newTag)) {
        toast.error('Tag already exists');
        return;
      }
      
      const updatedTags = [...currentTags, newTag];
      
      const { error } = await supabase
        .from('project_updates')
        .update({ tags: updatedTags })
        .eq('id', updateId);
      
      if (error) throw error;
      
      // Update local state
      setUpdates(updates.map(u => 
        u.id === updateId ? { ...u, tags: updatedTags } : u
      ));
      
      // Reset input
      setTagInput('');
      setActiveUpdateId(null);
      toast.success('Tag added successfully');
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast.error(`Failed to add tag: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveTag = async (updateId: string, tagToRemove: string) => {
    try {
      const update = updates.find(u => u.id === updateId);
      if (!update) return;
      
      const updatedTags = (update.tags || []).filter(tag => tag !== tagToRemove);
      
      const { error } = await supabase
        .from('project_updates')
        .update({ tags: updatedTags })
        .eq('id', updateId);
      
      if (error) throw error;
      
      // Update local state
      setUpdates(updates.map(u => 
        u.id === updateId ? { ...u, tags: updatedTags } : u
      ));
      
      toast.success('Tag removed successfully');
    } catch (error: any) {
      console.error('Error removing tag:', error);
      toast.error(`Failed to remove tag: ${error.message || 'Unknown error'}`);
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
                        <div className="flex gap-2 items-center">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                          </p>
                          {user?.id === update.user_id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteUpdate(update.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-line">{update.content}</p>
                      
                      {/* Tags section */}
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 items-center">
                          {(update.tags || []).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs gap-1 py-0">
                              {tag}
                              {user?.id === update.user_id && (
                                <X 
                                  className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                                  onClick={() => handleRemoveTag(update.id, tag)}
                                />
                              )}
                            </Badge>
                          ))}
                          
                          {user?.id === update.user_id && activeUpdateId !== update.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 rounded-full"
                              onClick={() => setActiveUpdateId(update.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Tag input */}
                        {activeUpdateId === update.id && (
                          <div className="flex gap-2 mt-2 items-center">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <Input
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add a tag..."
                              className="h-7 text-xs py-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTag(update.id);
                                } else if (e.key === 'Escape') {
                                  setActiveUpdateId(null);
                                  setTagInput('');
                                }
                              }}
                            />
                            <Button 
                              size="sm" 
                              className="h-7 px-2 py-0"
                              onClick={() => handleAddTag(update.id)}
                            >
                              Add
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 py-0"
                              onClick={() => {
                                setActiveUpdateId(null);
                                setTagInput('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < updates.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default ProjectUpdates;
