
import React from 'react';
import TextExtractionLoading from './TextExtractionLoading';
import TextExtractionError from './TextExtractionError';
import TextExtractionEmpty from './TextExtractionEmpty';
import ExtractedTextDisplay from './ExtractedTextDisplay';

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
      <TextExtractionLoading 
        message="Extracting text from PDF..." 
        description="This may take a moment depending on the file size." 
      />
    );
  }

  if (extractionError) {
    return (
      <TextExtractionError 
        errorMessage={extractionError}
        onRetryExtraction={onRetryExtraction}
        handleOpenPdfDirectly={handleOpenPdfDirectly}
      />
    );
  }

  if (isSummarizing) {
    return (
      <TextExtractionLoading 
        message="Generating summary..." 
        description="Our AI is analyzing your document and creating a concise summary." 
      />
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
      {extractedText ? (
        <ExtractedTextDisplay 
          extractedText={extractedText}
          isExtracting={isExtracting}
          extractionError={extractionError}
        />
      ) : (
        <TextExtractionEmpty />
      )}
    </div>
  );
};

export default TextExtractionContent;
