
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SummaryDialogHeader from './SummaryDialogHeader';
import SummaryContent from './SummaryContent';
import SummaryFooter from './SummaryFooter';
import SummaryAlert from './SummaryAlert';
import SummaryCloseButton from './SummaryCloseButton';
import { useSummaryDialog } from './hooks/useSummaryDialog';

export interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  isLoading: boolean;
  hasSavedVersion?: boolean;
  projectId?: string;
  imageName?: string;
  sourceUrl?: string;
  sourceType?: 'pdf' | 'image';
  onNoteSaved?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  isOpen,
  onClose,
  title,
  summary,
  isLoading,
  hasSavedVersion = false,
  projectId,
  imageName,
  sourceUrl,
  sourceType = 'pdf',
  onNoteSaved,
  error,
  onRetry
}) => {
  const {
    feedbackGiven,
    isCreatingNote,
    localHasSavedVersion,
    handleCopy,
    handleDownload,
    handleFeedback,
    handleCreateNote,
    hasSummary
  } = useSummaryDialog({
    isOpen,
    hasSavedVersion,
    summary,
    projectId,
    imageName,
    sourceUrl,
    sourceType,
    onNoteSaved
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col">
        <div className="absolute right-4 top-4">
          <SummaryCloseButton />
        </div>
        
        <SummaryDialogHeader 
          title={title} 
          hasSavedVersion={localHasSavedVersion} 
          isLoading={isLoading} 
        />
        
        <div className="mt-4 overflow-y-auto flex-grow">
          <SummaryContent 
            isLoading={isLoading} 
            summary={summary} 
            hasSummary={hasSummary} 
            error={error}
          />
        </div>
        
        <SummaryAlert 
          hasSummary={hasSummary}
          localHasSavedVersion={localHasSavedVersion}
          projectId={projectId}
        />
        
        <SummaryFooter 
          isLoading={isLoading}
          localHasSavedVersion={localHasSavedVersion}
          feedbackGiven={feedbackGiven}
          summary={summary}
          isCreatingNote={isCreatingNote}
          projectId={projectId}
          hasSummary={hasSummary}
          buttonText={localHasSavedVersion ? "Already Saved" : "Save as Note"}
          onFeedback={handleFeedback}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onCreateNote={handleCreateNote}
          error={error}
          onRetry={onRetry}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
