
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardCopy, Download, FileText } from "lucide-react";

interface SummaryActionsProps {
  summary: string;
  onCopy: () => void;
  onDownload: () => void;
  onCreateNote: () => void;
  isCreatingNote: boolean;
  projectId?: string;
  hasSummary: boolean;
  buttonText?: string;
}

const SummaryActions: React.FC<SummaryActionsProps> = ({
  summary,
  onCopy,
  onDownload,
  onCreateNote,
  isCreatingNote,
  projectId,
  hasSummary,
  buttonText = "Create Note"
}) => {
  const hasValidSummary = summary && summary.trim() !== '';
  
  if (!hasSummary) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        disabled={!hasValidSummary}
        title="Copy summary to clipboard"
      >
        <ClipboardCopy className="mr-2 h-4 w-4" />
        Copy
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        disabled={!hasValidSummary}
        title="Download summary as text file"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      
      {projectId && (
        <Button
          variant="default"
          size="sm"
          onClick={onCreateNote}
          disabled={isCreatingNote || !hasValidSummary}
          title="Save summary as a project note"
        >
          {isCreatingNote ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default SummaryActions;
