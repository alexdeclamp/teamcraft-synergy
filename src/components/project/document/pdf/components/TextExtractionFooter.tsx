
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Pencil } from 'lucide-react';

interface TextExtractionFooterProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractedText: string;
  showSummary: boolean;
  summary: string;
  handleDownloadText: () => void;
  handleCreateNote?: () => void;
  projectId?: string;
  fileName: string;
  pdfUrl: string;
}

const TextExtractionFooter: React.FC<TextExtractionFooterProps> = ({
  isExtracting,
  isSummarizing,
  extractedText,
  showSummary,
  summary,
  handleDownloadText,
  handleCreateNote,
  projectId
}) => {
  if (!isExtracting && !isSummarizing && extractedText) {
    return (
      <DialogFooter className="flex-shrink-0 mt-4 border-t pt-4 w-full">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end w-full gap-2">
          <div className="flex-shrink-0 sm:mr-auto">
            {projectId && handleCreateNote && (
              <Button 
                onClick={handleCreateNote}
                variant="outline"
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <Pencil className="h-4 w-4" />
                Create Note
              </Button>
            )}
          </div>
          <Button 
            onClick={handleDownloadText}
            variant="outline"
            className="flex items-center gap-1 w-full sm:w-auto"
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
