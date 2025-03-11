
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';

interface TextExtractionHeaderProps {
  fileName: string;
  pageCount: number;
  textLength: number;
  showSummary: boolean;
  summary: string;
  toggleTextView: () => void;
  isSummarizing: boolean;
  diagnosisInfo?: string | null;
  pdfInfo?: { isEncrypted: boolean } | null;
}

const TextExtractionHeader: React.FC<TextExtractionHeaderProps> = ({
  fileName,
  pageCount,
  textLength,
  showSummary,
  summary,
  toggleTextView,
  isSummarizing,
  diagnosisInfo,
  pdfInfo
}) => {
  return (
    <DialogHeader>
      <div className="absolute right-4 top-4">
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>
      
      <DialogTitle className="flex items-center justify-between">
        <div>
          {showSummary && summary ? 'Summary' : 'Extracted Text'} - {fileName}
          {pageCount > 0 && !showSummary && (
            <span className="text-sm text-muted-foreground ml-2">
              ({pageCount} pages, {textLength > 0 ? `${textLength.toLocaleString()} characters` : ''})
            </span>
          )}
        </div>
        {summary && !isSummarizing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTextView}
            className="ml-4"
            disabled={isSummarizing || (!summary && showSummary)}
          >
            {showSummary ? 'Show Full Text' : 'Show Summary'}
          </Button>
        )}
      </DialogTitle>
      
      {diagnosisInfo && (
        <DialogDescription className="text-amber-500">
          <Info className="h-4 w-4 inline mr-1" />
          {diagnosisInfo}
        </DialogDescription>
      )}
      {pdfInfo?.isEncrypted && (
        <DialogDescription className="text-amber-500">
          <Info className="h-4 w-4 inline mr-1" />
          This PDF is encrypted which may limit text extraction capabilities.
        </DialogDescription>
      )}
    </DialogHeader>
  );
};

export default TextExtractionHeader;
