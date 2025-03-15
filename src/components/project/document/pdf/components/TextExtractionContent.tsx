
import React from 'react';
import { Loader2, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TextExtractionBanner from './TextExtractionBanner';

interface TextExtractionContentProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractionError: string | null;
  extractedText: string;
  summary: string;
  showSummary: boolean;
  onRetryExtraction: () => void;
  handleOpenPdfDirectly: () => void;
}

const TextExtractionContent: React.FC<TextExtractionContentProps> = ({
  isExtracting,
  isSummarizing,
  extractionError,
  extractedText,
  summary,
  showSummary,
  onRetryExtraction,
  handleOpenPdfDirectly
}) => {
  if (isExtracting) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium">Extracting text from PDF...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a moment depending on the file size.</p>
      </div>
    );
  }

  if (extractionError) {
    return (
      <div className="py-8 px-4">
        <div className="p-4 bg-destructive/10 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium text-destructive">{extractionError}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              This could be due to an inaccessible PDF, incompatible format, or server limitations.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={onRetryExtraction}>
                Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenPdfDirectly}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open PDF Directly
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSummarizing) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium">Generating summary...</p>
        <p className="text-sm text-muted-foreground mt-2">Our AI is analyzing your document and creating a concise summary.</p>
      </div>
    );
  }

  if (showSummary && summary) {
    return (
      <div className="py-4 px-1">
        <div className="bg-muted/40 rounded-md p-4 max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm relative">
          {summary}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-1">
      <TextExtractionBanner 
        isExtracting={isExtracting}
        extractionError={extractionError}
        extractedText={extractedText}
      />
      
      {extractedText ? (
        <div className="bg-muted/40 rounded-md p-4 max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm font-mono relative">
          {extractedText}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">No text could be extracted from this PDF. It may be an image-based PDF.</p>
        </div>
      )}
    </div>
  );
};

export default TextExtractionContent;
