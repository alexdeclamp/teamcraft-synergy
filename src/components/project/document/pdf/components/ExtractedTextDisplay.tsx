
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import QuestionAnswerSection from './QuestionAnswerSection';
import TextExtractionBanner from './TextExtractionBanner';

interface ExtractedTextDisplayProps {
  extractedText: string;
  isExtracting: boolean;
  extractionError: string | null;
}

const ExtractedTextDisplay: React.FC<ExtractedTextDisplayProps> = ({
  extractedText,
  isExtracting,
  extractionError
}) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <TextExtractionBanner 
        isExtracting={isExtracting}
        extractionError={extractionError}
        extractedText={extractedText}
      />
      
      <QuestionAnswerSection extractedText={extractedText} />
      
      <div className="bg-muted/40 rounded-md p-4 mt-4 whitespace-pre-wrap text-sm font-mono">
        {extractedText}
      </div>
    </ScrollArea>
  );
};

export default ExtractedTextDisplay;
