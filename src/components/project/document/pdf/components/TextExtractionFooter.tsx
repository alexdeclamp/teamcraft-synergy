
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Pencil } from 'lucide-react';

interface TextExtractionFooterProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractedText: string;
  showSummary: boolean;
  handleDownloadText: () => void;
  handleCreateNote?: () => void;
  projectId?: string;
}

const TextExtractionFooter: React.FC<TextExtractionFooterProps> = ({
  isExtracting,
  isSummarizing,
  extractedText,
  showSummary,
  handleDownloadText,
  handleCreateNote,
  projectId
}) => {
  if (!isExtracting && !isSummarizing && extractedText) {
    return (
      <DialogFooter className="mt-4 flex-shrink-0">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between w-full gap-2">
          <div className="flex-shrink-0">
            {projectId && handleCreateNote && (
              <Button 
                onClick={handleCreateNote}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" />
                Create Note
              </Button>
            )}
          </div>
          <Button 
            onClick={handleDownloadText}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download {showSummary ? 'Summary' : 'Text'}
          </Button>
        </div>
      </DialogFooter>
    );
  }
  
  return null;
};

export default TextExtractionFooter;
