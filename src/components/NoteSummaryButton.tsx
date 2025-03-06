
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Loader2, FileText } from 'lucide-react';
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
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Fetch existing summary if available
  useEffect(() => {
    const fetchSavedSummary = async () => {
      if (!noteId || !projectId) return;
      
      try {
        setIsLoadingSaved(true);
        const { data, error } = await supabase
          .from('note_summaries')
          .select('summary')
          .eq('note_id', noteId)
          .maybeSingle();
        
        if (error) {
          console.log('Error fetching saved summary:', error.message);
          return;
        }
        
        if (data?.summary) {
          console.log('Found saved summary for note:', noteId);
          setSavedSummary(data.summary);
        }
      } catch (error) {
        console.error('Error fetching saved summary:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };
    
    fetchSavedSummary();
  }, [noteId, projectId]);

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
      
      // If we have a saved summary, use it immediately while generating a new one
      if (savedSummary) {
        setSummary(savedSummary);
      } else {
        setSummary(''); // Reset any previous summary
      }
      
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
          noteId, // Pass noteId to the edge function
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
      // Update savedSummary state to reflect the latest summary
      setSavedSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
      if (!savedSummary) {
        setIsDialogOpen(false);
      }
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
        title={savedSummary ? "View Saved AI Summary" : "Generate AI Summary"}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" /> 
        ) : savedSummary ? (
          <FileText className="h-4 w-4 text-blue-500" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </Button>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Summary of "${noteTitle}"`}
        summary={summary}
        isLoading={isGenerating && !savedSummary}
        hasSavedVersion={!!savedSummary}
      />
    </>
  );
};

export default NoteSummaryButton;
