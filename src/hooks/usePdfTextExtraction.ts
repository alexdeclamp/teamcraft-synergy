
import { useState, useEffect } from 'react';
import { usePdfExtraction } from './pdf/usePdfExtraction';
import { usePdfSummarization } from './pdf/usePdfSummarization';

interface UsePdfTextExtractionProps {
  pdfUrl: string;
  fileName: string;
  projectId?: string;
}

export const usePdfTextExtraction = ({ pdfUrl, fileName, projectId }: UsePdfTextExtractionProps) => {
  // Explicitly create the modal visibility state
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

  // Custom function to handle extraction and show modal
  const handleExtractAndShowModal = async () => {
    // Open the modal first
    setShowTextModal(true);
    // Then start extraction
    await handleExtractText();
  };

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
    handleExtractText: handleExtractAndShowModal, // Override with our version that shows the modal
    handleSummarizeText,
    toggleTextView,
    handleRetryExtraction,
    projectId
  };
};
