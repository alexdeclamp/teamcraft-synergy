
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, RefreshCw } from 'lucide-react';

interface SummaryFooterProps {
  isLoading: boolean;
  localHasSavedVersion: boolean;
  feedbackGiven: boolean;
  summary: string;
  isCreatingNote: boolean;
  projectId?: string;
  hasSummary: boolean;
  buttonText: string;
  error?: string | null;
  onFeedback: (isPositive: boolean) => void;
  onCopy: () => void;
  onDownload: () => void;
  onCreateNote: () => void;
  onRetry?: () => void;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({
  isLoading,
  localHasSavedVersion,
  summary,
  isCreatingNote,
  projectId,
  hasSummary,
  buttonText,
  error,
  onDownload,
  onCreateNote,
  onRetry
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
      <div className="flex space-x-2 w-full sm:w-auto justify-end">
        {error && onRetry && (
          <Button 
            onClick={onRetry} 
            size="sm" 
            variant="outline"
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}

        {!isLoading && summary && !error && (
          <Button 
            onClick={onCreateNote} 
            size="sm" 
            disabled={isCreatingNote || !projectId || localHasSavedVersion}
            className="gap-1"
          >
            {isCreatingNote ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {buttonText}
          </Button>
        )}

        {!isLoading && summary && !error && (
          <Button onClick={onDownload} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => document.getElementById('close-summary-dialog')?.click()}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default SummaryFooter;
