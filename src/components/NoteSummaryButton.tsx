
import React, { useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useLocation } from 'react-router-dom';
import SummaryDialog from './summary/SummaryDialog';
import { useNoteSummary } from '@/hooks/useNoteSummary';
import ImageSummaryButtonUI from './summary/ImageSummaryButtonUI';
import { useIsMobile } from '@/hooks/use-mobile';

interface NoteSummaryButtonProps {
  noteId: string;
  noteContent: string | null;
  noteName?: string;
  projectId?: string;
}

const NoteSummaryButton: React.FC<NoteSummaryButtonProps> = ({
  noteId,
  noteContent,
  noteName,
  projectId
}) => {
  const { id: paramProjectId } = useParams<{ id: string }>();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const finalProjectId = projectId || paramProjectId;
  
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
    noteName,
    projectId: finalProjectId
  });
  
  // Ensure dialog is closed and DOM is cleaned up when component unmounts or route changes
  useEffect(() => {
    return () => {
      if (isDialogOpen) {
        setIsDialogOpen(false);
        document.body.style.overflow = '';
        document.body.classList.remove('dialog-open', 'sheet-open');
      }
    };
  }, [location.pathname, isDialogOpen, setIsDialogOpen]);

  // Don't render the button on mobile devices
  if (isMobile) {
    return null;
  }

  // Close handler to ensure cleanup
  const handleClose = () => {
    setIsDialogOpen(false);
    document.body.style.overflow = '';
    document.body.classList.remove('dialog-open', 'sheet-open');
  };

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
        onClose={handleClose}
        title={`Summary of "${noteName || 'Note'}"`}
        summary={summary}
        isLoading={isGenerating && !hasSummary}
        hasSavedVersion={hasSummary}
        projectId={finalProjectId}
      />
    </>
  );
};

export default NoteSummaryButton;
