
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CleanUpdateButton from './update/CleanUpdateButton';

interface ProjectQuickUpdateProps {
  projectId: string;
  onUpdateAdded: () => void;
}

const ProjectQuickUpdate: React.FC<ProjectQuickUpdateProps> = ({ 
  projectId,
  onUpdateAdded
}) => {
  const [updateContent, setUpdateContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiModel, setAiModel] = useState<'claude' | 'openai'>('claude');
  const { user } = useAuth();
  
  // Sanitize content before submitting
  const sanitizeContent = (content: string): string => {
    // Basic sanitization - remove any script tags or dangerous elements
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  };
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = updateContent.trim();
    
    if (!trimmedContent) {
      toast.error('Please enter an update');
      return;
    }
    
    if (!user?.id) {
      toast.error('You must be logged in to post an update');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Sanitize the content before saving to the database
      const safeContent = sanitizeContent(trimmedContent);
      
      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          content: safeContent,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setUpdateContent('');
      toast.success('Update posted successfully');
      onUpdateAdded();
    } catch (error: any) {
      console.error('Error posting update:', error);
      toast.error(`Failed to post update: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateContent, projectId, user, onUpdateAdded]);

  const handleCleanedText = useCallback((cleanedText: string) => {
    setUpdateContent(cleanedText);
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Textarea
              placeholder="Share a quick update with your team..."
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={5000} // Add a reasonable limit
            />
            
            <div className="flex justify-between items-center">
              <CleanUpdateButton 
                updateContent={updateContent}
                onTextCleaned={handleCleanedText}
                model={aiModel}
                onModelChange={setAiModel}
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !updateContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Update'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectQuickUpdate;
