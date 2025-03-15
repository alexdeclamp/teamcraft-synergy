
import React from 'react';
import { Info } from 'lucide-react';

interface TextExtractionBannerProps {
  isExtracting: boolean;
  extractionError: string | null;
  extractedText: string;
}

const TextExtractionBanner: React.FC<TextExtractionBannerProps> = ({
  isExtracting,
  extractionError,
  extractedText
}) => {
  // Only show the banner when text extraction is complete and successful
  if (isExtracting || extractionError || !extractedText) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-blue-700">Text successfully extracted from your document</p>
        <p className="text-blue-600">
          You can now create a note with this content and enhance it with AI to generate summaries, improve formatting, or extract key insights.
        </p>
      </div>
    </div>
  );
};

export default TextExtractionBanner;
