
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, FileText } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import SummaryDialog from './summary/SummaryDialog';
import { useNoteSummary } from '@/hooks/useNoteSummary';

interface NoteSummaryButtonProps {
  noteId: string;
  content: string | null;
  title: string;
}

const NoteSummaryButton: React.FC<NoteSummaryButtonProps> = ({
  noteId,
  content,
  title
}) => {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  
  const {
    isGenerating,
    summary,
    hasSummary,
    isDialogOpen,
    setIsDialogOpen,
    generateSummary
  } = useNoteSummary({
    noteId,
    noteContent: content,
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
          if (hasSummary) {
            setIsDialogOpen(true);
          } else {
            generateSummary();
          }
        }}
        disabled={isGenerating || !content}
        title={hasSummary ? "View Saved AI Summary" : "Generate AI Summary"}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" /> 
        ) : hasSummary ? (
          <FileText className="h-4 w-4 text-blue-500" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </Button>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Summary of "${title}"`}
        summary={summary}
        isLoading={isGenerating && !hasSummary}
        hasSavedVersion={hasSummary}
        projectId={projectId}
      />
    </>
  );
};

export default NoteSummaryButton;
