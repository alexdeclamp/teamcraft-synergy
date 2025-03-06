
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
      
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          type: 'note',
          content: noteContent,
          projectId: projectId,
          userId: (await supabase.auth.getUser()).data.user?.id
        },
      });

      if (error) throw error;
      
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
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
