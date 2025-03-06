
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, FileText } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import SummaryDialog from './SummaryDialog';
import { useNoteSummary } from '@/hooks/useNoteSummary';

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
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  
  const {
    isGenerating,
    summary,
    savedSummary,
    isDialogOpen,
    setIsDialogOpen,
    generateSummary
  } = useNoteSummary({
    noteId,
    noteContent,
    projectId
  });
  
  // Close dialog when navigation happens
  useEffect(() => {
    return () => {
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }
    };
  }, [location.pathname, isDialogOpen, setIsDialogOpen]);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => {
          if (savedSummary) {
            setIsDialogOpen(true);
          } else {
            generateSummary();
          }
        }}
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
