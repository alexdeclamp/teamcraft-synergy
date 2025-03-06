
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectQuickUpdateProps {
  projectId: string;
  onUpdateAdded?: () => void;
}

const ProjectQuickUpdate: React.FC<ProjectQuickUpdateProps> = ({ projectId, onUpdateAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: content.trim()
        });
      
      if (error) throw error;
      
      toast.success('Update posted successfully');
      setContent('');
      
      if (onUpdateAdded) {
        onUpdateAdded();
      }
    } catch (error: any) {
      console.error('Error posting update:', error);
      toast.error(`Failed to post update: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-card rounded-lg p-4 border">
      <Textarea
        placeholder="Share a quick project update with your team..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none focus-visible:ring-primary"
        disabled={isSubmitting}
      />
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="flex gap-2 items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <SendHorizontal className="h-4 w-4" />
              Post Update
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectQuickUpdate;
