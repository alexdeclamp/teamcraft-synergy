
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardCopy, Download, FileText, Brain } from "lucide-react";

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
  buttonText = "Save as Note"
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
          variant={buttonText === "Already Saved" ? "outline" : "default"}
          size="sm"
          onClick={onCreateNote}
          disabled={isCreatingNote || !hasValidSummary || buttonText === "Already Saved"}
          title={buttonText === "Already Saved" ? "This summary has already been saved" : "Save summary as a project note"}
          className={buttonText === "Already Saved" ? "text-green-600 border-green-200 bg-green-50" : ""}
        >
          {isCreatingNote ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : buttonText === "Already Saved" ? (
            <FileText className="mr-2 h-4 w-4" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default SummaryActions;
