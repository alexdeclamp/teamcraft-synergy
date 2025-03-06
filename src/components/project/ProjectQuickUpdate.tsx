
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectQuickUpdateProps {
  projectId: string;
  onUpdateAdded?: (update: any) => void;
}

const ProjectQuickUpdate: React.FC<ProjectQuickUpdateProps> = ({ projectId, onUpdateAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user || !projectId) return;
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: content.trim()
        })
        .select('*, profiles:user_id(full_name, avatar_url)')
        .single();
      
      if (error) throw error;
      
      toast.success('Update added successfully');
      setContent('');
      
      if (onUpdateAdded && data) {
        onUpdateAdded(data);
      }
    } catch (error: any) {
      console.error('Error adding update:', error);
      toast.error(`Failed to add update: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Quick Update</CardTitle>
        <CardDescription>
          Share a quick update about the project with your team
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="What's happening with the project?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {content.length}/500
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Post Update
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectQuickUpdate;
