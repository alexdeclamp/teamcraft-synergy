
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextExtractionErrorProps {
  errorMessage: string;
  onRetryExtraction: () => void;
  handleOpenPdfDirectly: () => void;
}

const TextExtractionError: React.FC<TextExtractionErrorProps> = ({
  errorMessage,
  onRetryExtraction,
  handleOpenPdfDirectly
}) => {
  return (
    <div className="py-8 px-4">
      <div className="p-4 bg-destructive/10 rounded-lg flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
        <div>
          <p className="font-medium text-destructive">{errorMessage}</p>
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
};

export default TextExtractionError;
