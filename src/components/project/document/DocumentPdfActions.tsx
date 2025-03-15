
import React from 'react';
import { FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { usePdfTextExtraction } from '@/hooks/usePdfTextExtraction';
import TextExtractionDialog from './pdf/TextExtractionDialog';

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
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleExtractText}
        disabled={isExtracting}
      >
        <FileSearch className="h-4 w-4" />
        <span>Extract Text</span>
        <Badge variant="outline" className="ml-1 text-xs py-0 h-5">BETA</Badge>
      </Button>

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
