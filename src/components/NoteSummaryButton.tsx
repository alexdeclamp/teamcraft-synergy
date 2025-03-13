import React, { useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useLocation } from 'react-router-dom';
import SummaryDialog from './summary/SummaryDialog';
import { useNoteSummary } from '@/hooks/useNoteSummary';
import ImageSummaryButtonUI from './summary/ImageSummaryButtonUI';

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
    hasSummary,
    isDialogOpen,
    setIsDialogOpen,
    generateSummary
  } = useNoteSummary({
    noteId,
    noteContent,
    projectId
  });
  
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
        disabled={isGenerating || !noteContent}
        title={hasSummary ? "View Saved AI Summary" : "Generate AI Summary"}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" /> 
        ) : hasSummary ? (
          <FileText className="h-4 w-4 text-blue-500" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </Button>

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`Summary of "${noteTitle}"`}
        summary={summary}
        isLoading={isGenerating && !hasSummary}
        hasSavedVersion={hasSummary}
        projectId={projectId}
      />
    </>
  );
};

export default NoteSummaryButton;
