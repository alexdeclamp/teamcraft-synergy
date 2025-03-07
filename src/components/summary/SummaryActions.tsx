
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileText, Loader2 } from 'lucide-react';
import { DialogClose } from "@/components/ui/dialog";

interface SummaryActionsProps {
  summary: string;
  onCopy: () => void;
  onDownload: () => void;
  onCreateNote: () => void;
  isCreatingNote: boolean;
  projectId?: string;
  hasSummary?: boolean;
}

const SummaryActions: React.FC<SummaryActionsProps> = ({
  summary,
  onCopy,
  onDownload,
  onCreateNote,
  isCreatingNote,
  projectId,
  hasSummary = false
}) => {
  if (!hasSummary) {
    return (
      <DialogClose asChild>
        <Button variant="outline" size="sm">Close</Button>
      </DialogClose>
    );
  }

  return (
    <div className="flex space-x-2">
      <Button 
        onClick={onCreateNote} 
        size="sm" 
        disabled={isCreatingNote || !projectId}
        className="gap-1"
      >
        {isCreatingNote ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Create Note
      </Button>
      <Button onClick={onCopy} size="sm" variant="outline">
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
      <Button onClick={onDownload} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
      <DialogClose asChild>
        <Button variant="outline" size="sm">Close</Button>
      </DialogClose>
    </div>
  );
};

export default SummaryActions;
