
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectSettingsProps {
  projectId: string;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiPersona, setAiPersona] = useState('');
  const { toast } = useToast();

  // Fetch project details when component mounts
  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('title, description, ai_persona')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.title);
          setDescription(data.description || '');
          setAiPersona(data.ai_persona || '');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brain settings',
          variant: 'destructive',
        });
      }
    };

    fetchProject();
  }, [projectId, toast]);

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Brain settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update brain settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brain Settings</CardTitle>
        <CardDescription>
          Configure your brain's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Brain Name
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter brain name"
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
              placeholder="Enter brain description"
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

          <div className="flex items-center gap-4">
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
