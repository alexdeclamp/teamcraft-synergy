
import React from 'react';
import { FileSearch, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePdfTextExtraction } from '@/hooks/usePdfTextExtraction';
import TextExtractionDialog from './pdf/TextExtractionDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentPdfActionsProps {
  pdfUrl: string;
  fileName: string;
  projectId?: string;
}

const DocumentPdfActions: React.FC<DocumentPdfActionsProps> = ({
  pdfUrl,
  fileName,
  projectId
}) => {
  const {
    showTextModal,
    setShowTextModal,
    extractedText,
    isExtracting,
    extractionError,
    pageCount,
    diagnosisInfo,
    pdfInfo,
    textLength,
    isSummarizing,
    summary,
    showSummary,
    handleExtractText,
    handleSummarizeText,
    toggleTextView,
    handleRetryExtraction
  } = usePdfTextExtraction({ pdfUrl, fileName, projectId });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleExtractText}
                disabled={isExtracting}
              >
                <FileSearch className="h-4 w-4" />
                <span>Extract Text</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] p-4">
            <div className="space-y-2">
              <p className="font-medium">Extract Text Features:</p>
              <ul className="text-sm space-y-1.5">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span>Extract and view all text content from PDF</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span>Generate AI summary of document content</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span>Ask questions about the document</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span>Save content as project notes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span>Download extracted text or summary</span>
                </li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TextExtractionDialog
        showTextModal={showTextModal}
        setShowTextModal={setShowTextModal}
        isExtracting={isExtracting}
        extractedText={extractedText}
        extractionError={extractionError}
        diagnosisInfo={diagnosisInfo}
        pdfInfo={pdfInfo}
        textLength={textLength}
        pageCount={pageCount}
        fileName={fileName}
        pdfUrl={pdfUrl}
        onRetryExtraction={handleRetryExtraction}
        handleSummarizeText={handleSummarizeText}
        isSummarizing={isSummarizing}
        summary={summary}
        showSummary={showSummary}
        toggleTextView={toggleTextView}
        projectId={projectId}
      />
    </>
  );
};

export default DocumentPdfActions;
