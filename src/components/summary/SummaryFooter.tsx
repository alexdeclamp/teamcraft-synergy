
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import SummaryFeedback from './SummaryFeedback';
import SummaryActions from './SummaryActions';

interface SummaryFooterProps {
  isLoading: boolean;
  localHasSavedVersion: boolean;
  feedbackGiven: boolean;
  summary: string;
  isCreatingNote: boolean;
  projectId?: string;
  hasSummary: boolean;
  buttonText: string;
  onFeedback: (isPositive: boolean) => void;
  onCopy: () => void;
  onDownload: () => void;
  onCreateNote: () => void;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({
  isLoading,
  localHasSavedVersion,
  feedbackGiven,
  summary,
  isCreatingNote,
  projectId,
  hasSummary,
  buttonText,
  onFeedback,
  onCopy,
  onDownload,
  onCreateNote
}) => {
  return (
    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-4">
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        {!isLoading && localHasSavedVersion && !feedbackGiven && (
          <SummaryFeedback 
            feedbackGiven={feedbackGiven} 
            onFeedback={onFeedback} 
          />
        )}
        {feedbackGiven && (
          <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
        )}
      </div>
      
      <SummaryActions 
        summary={summary}
        onCopy={onCopy}
        onDownload={onDownload}
        onCreateNote={onCreateNote}
        isCreatingNote={isCreatingNote}
        projectId={projectId}
        hasSummary={hasSummary}
        buttonText={buttonText}
      />
    </DialogFooter>
  );
};

export default SummaryFooter;
