
import { useState, useEffect } from 'react';
import { usePdfExtraction } from './pdf/usePdfExtraction';
import { usePdfSummarization } from './pdf/usePdfSummarization';

interface UsePdfTextExtractionProps {
  pdfUrl: string;
  fileName: string;
  projectId?: string;
}

export const usePdfTextExtraction = ({ pdfUrl, fileName, projectId }: UsePdfTextExtractionProps) => {
  const [showTextModal, setShowTextModal] = useState(false);
  
  // Import extraction functionality from the smaller hooks
  const {
    extractedText,
    isExtracting,
    extractionError,
    pageCount,
    diagnosisInfo,
    pdfInfo,
    textLength,
    handleExtractText,
    handleRetryExtraction
  } = usePdfExtraction({ pdfUrl, fileName });
  
  // Import summarization functionality from the smaller hooks
  const {
    isSummarizing,
    summary,
    showSummary,
    handleSummarizeText,
    toggleTextView,
    setShowSummary
  } = usePdfSummarization({ extractedText, fileName, projectId });

  // Reset state when the modal is closed
  useEffect(() => {
    if (!showTextModal) {
      // We don't reset everything to allow viewing the results again without re-extraction
      setShowSummary(false);
    }
  }, [showTextModal, setShowSummary]);

  return {
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
    handleRetryExtraction,
    projectId
  };
};
