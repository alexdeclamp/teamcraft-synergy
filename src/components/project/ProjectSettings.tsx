import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Star, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectSettingsProps {
  projectId: string;
  project?: any;
  members?: any[];
  setMembers?: React.Dispatch<React.SetStateAction<any[]>>;
  userRole?: string;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ 
  projectId,
  project: initialProject,
  members,
  setMembers,
  userRole
}) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiPersona, setAiPersona] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description || '');
      setAiPersona(initialProject.ai_persona || '');
      setIsFavorite(initialProject.is_favorite || false);
      setIsArchived(initialProject.is_archived || false);
      return;
    }
    
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('title, description, ai_persona, is_favorite, is_archived')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.title);
          setDescription(data.description || '');
          setAiPersona(data.ai_persona || '');
          setIsFavorite(data.is_favorite || false);
          setIsArchived(data.is_archived || false);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project settings',
          variant: 'destructive',
        });
      }
    };

    fetchProject();
  }, [projectId, initialProject, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: title.trim(),
          description: description.trim(),
          ai_persona: aiPersona.trim(),
          is_favorite: isFavorite,
          is_archived: isArchived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>
          Configure your project's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project name"
              className="max-w-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="max-w-md"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="aiPersona" className="text-sm font-medium">
              AI Persona
            </label>
            <Textarea
              id="aiPersona"
              value={aiPersona}
              onChange={(e) => setAiPersona(e.target.value)}
              placeholder="Describe how you want the AI assistant to behave, e.g., 'Act as a helpful project manager who prioritizes tasks and suggests next steps'"
              className="max-w-md"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will guide how the AI assistant responds when discussing your project.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Project Status</h3>
            
            <div className="flex items-center justify-between max-w-md">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Favorite Project</span>
              </div>
              <Switch
                checked={isFavorite}
                onCheckedChange={setIsFavorite}
              />
            </div>
            
            <div className="flex items-center justify-between max-w-md">
              <div className="flex items-center space-x-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span>Archive Project</span>
              </div>
              <Switch
                checked={isArchived}
                onCheckedChange={setIsArchived}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectSettings;
