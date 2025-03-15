
import React from 'react';
import TextExtractionLoading from './TextExtractionLoading';
import TextExtractionError from './TextExtractionError';
import TextExtractionEmpty from './TextExtractionEmpty';
import ExtractedTextDisplay from './ExtractedTextDisplay';
import QuestionAnswerForm from './QuestionAnswerForm';
import QuestionAnswerResult from './QuestionAnswerResult';

interface TextExtractionContentProps {
  isExtracting: boolean;
  isSummarizing: boolean;
  extractionError: string | null;
  extractedText: string;
  summary: string;
  showSummary: boolean;
  onRetryExtraction: () => void;
  handleOpenPdfDirectly: () => void;
  currentQuestion: string;
  answer: string;
  isAnswering: boolean;
  onAskQuestion: (question: string) => void;
}

const TextExtractionContent: React.FC<TextExtractionContentProps> = ({
  isExtracting,
  isSummarizing,
  extractionError,
  extractedText,
  summary,
  showSummary,
  onRetryExtraction,
  handleOpenPdfDirectly,
  currentQuestion,
  answer,
  isAnswering,
  onAskQuestion
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
        <div className="space-y-4">
          {!showSummary && (
            <>
              <QuestionAnswerForm 
                isLoading={isAnswering} 
                onAskQuestion={onAskQuestion} 
              />
              <QuestionAnswerResult 
                question={currentQuestion} 
                answer={answer} 
                isLoading={isAnswering} 
              />
            </>
          )}
          <ExtractedTextDisplay 
            extractedText={extractedText}
            isExtracting={isExtracting}
            extractionError={extractionError}
          />
        </div>
      ) : (
        <TextExtractionEmpty />
      )}
    </div>
  );
};

export default TextExtractionContent;
