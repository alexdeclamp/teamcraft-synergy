
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Pencil } from 'lucide-react';
import SummaryOptions from '../SummaryOptions';

interface TextExtractionFooterProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractedText: string;
  showSummary: boolean;
  handleDownloadText: () => void;
  handleSummarizeText: (model: 'claude' | 'openai') => void;
  handleCreateNote?: () => void;
  projectId?: string;
}

const TextExtractionFooter: React.FC<TextExtractionFooterProps> = ({
  isExtracting,
  isSummarizing,
  extractedText,
  showSummary,
  handleDownloadText,
  handleSummarizeText,
  handleCreateNote,
  projectId
}) => {
  if (!isExtracting && !isSummarizing && extractedText) {
    return (
      <DialogFooter className="mt-4 flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          {!showSummary && (
            <SummaryOptions onSummarize={handleSummarizeText} />
          )}
          
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
      </DialogFooter>
    );
  }
  
  return null;
};

export default TextExtractionFooter;
