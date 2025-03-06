
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SummaryDialog from './SummaryDialog';
import { useParams } from 'react-router-dom';

interface NoteSummaryButtonProps {
  noteId: string;
  noteTitle: string;
  noteContent: string | null;
}

const NoteSummaryButton: React.FC<NoteSummaryButtonProps> = ({
  noteId,
  noteTitle,
  noteContent
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();

  const generateSummary = async () => {
    if (!noteContent) {
      toast.error('Cannot generate summary for empty note content');
      return;
    }

    if (!projectId) {
      toast.error('Project ID is required for generating summaries');
      return;
    }

    try {
      setIsGenerating(true);
      setIsDialogOpen(true);
      setSummary(''); // Reset any previous summary
      
      console.log('Generating summary for note:', noteId);
      console.log('Project ID:', projectId);
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      console.log('User ID:', userId);
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'note',
          content: noteContent,
          projectId,
          userId,
        },
      });

      if (error) {
        console.error('Error from generate-summary function:', error);
        throw error;
      }
      
      console.log('Summary response:', data);
      
      if (!data || !data.summary) {
        console.error('Unexpected response format:', data);
        throw new Error('Received empty or invalid response from the summary generator');
      }
      
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
      setIsDialogOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={generateSummary}
        disabled={isGenerating || !noteContent}
        title="Generate AI Summary"
      >
        {isGenerating ? 
          <Loader2 className="h-4 w-4 animate-spin" /> : 
          <MessageSquare className="h-4 w-4" />
        }
      </Button>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Summary of "${noteTitle}"`}
        summary={summary}
        isLoading={isGenerating}
      />
    </>
  );
};

export default NoteSummaryButton;
