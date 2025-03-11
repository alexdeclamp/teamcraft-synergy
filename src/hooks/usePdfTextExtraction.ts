
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { extractPdfText, getPdfInfo } from '@/utils/pdfUtils';
import { summarizeText, SummaryModel } from '@/utils/summaryUtils';

interface UsePdfTextExtractionProps {
  pdfUrl: string;
  fileName: string;
  projectId?: string;
}

export const usePdfTextExtraction = ({ pdfUrl, fileName, projectId }: UsePdfTextExtractionProps) => {
  const [showTextModal, setShowTextModal] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [diagnosisInfo, setDiagnosisInfo] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{pageCount: number; isEncrypted: boolean; fingerprint: string} | null>(null);
  const [textLength, setTextLength] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const verifyPdfUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('Verifying PDF URL:', url);
      
      try {
        new URL(url);
      } catch (e) {
        throw new Error(`Invalid URL format: ${e.message}`);
      }
      
      const headResponse = await fetch(url, { method: 'HEAD' });
      
      if (!headResponse.ok) {
        throw new Error(`PDF URL is not accessible: ${headResponse.status} ${headResponse.statusText}`);
      }
      
      console.log('PDF URL is valid and accessible');
      return true;
    } catch (error: any) {
      console.error('PDF URL verification failed:', error);
      setDiagnosisInfo(`URL verification failed: ${error.message}`);
      return false;
    }
  };

  const handleExtractText = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setDiagnosisInfo(null);
    setPdfInfo(null);
    setExtractedText('');
    setSummary('');
    setShowSummary(false);
    setShowTextModal(true);
    
    try {
      toast.info("Extracting text from PDF...", {
        duration: 5000,
      });
      
      console.log('PDF URL to extract:', pdfUrl);
      
      const isUrlValid = await verifyPdfUrl(pdfUrl);
      
      if (!isUrlValid) {
        throw new Error('PDF URL is not accessible. Please check the file exists and try again.');
      }
      
      try {
        const info = await getPdfInfo(pdfUrl);
        setPdfInfo(info);
        console.log('PDF info:', info);
        
        if (info.isEncrypted) {
          setDiagnosisInfo('Warning: This PDF appears to be encrypted, which may limit text extraction');
        }
      } catch (infoError) {
        console.error('Failed to get PDF info:', infoError);
      }
      
      try {
        const result = await extractPdfText(pdfUrl);
        if (result.text && result.text.trim().length > 0) {
          setExtractedText(result.text);
          setPageCount(result.pageCount || 0);
          setTextLength(result.text.length);
          toast.success(`Successfully extracted ${result.text.length.toLocaleString()} characters from ${result.pageCount || 0} pages`);
        } else {
          setExtractedText('');
          toast.warning("No text content found in the document.");
        }
      } catch (extractionError: any) {
        console.error('PDF extraction failed:', extractionError);
        setDiagnosisInfo(`Extraction error: ${extractionError.message}`);
        throw extractionError;
      }
    } catch (error: any) {
      console.error('Error extracting text:', error);
      const errorMessage = error.message || 'Failed to extract text from the PDF';
      setExtractionError(errorMessage);
      toast.error(`Extraction failed: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSummarizeText = async (model: SummaryModel = 'claude') => {
    if (!extractedText) {
      toast.error('No text available to summarize');
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      console.log(`Starting summarization with ${model}...`);
      console.log(`Text length: ${extractedText.length} characters`);
      
      const result = await summarizeText({
        text: extractedText,
        model,
        title: fileName,
        projectId,
        maxLength: 2000
      });

      console.log("Summary received:", result ? "success" : "empty");
      if (!result) {
        throw new Error("Received empty summary");
      }

      setSummary(result);
      setShowSummary(true);
      toast.success(`Text summarized successfully using ${model === 'claude' ? 'Claude' : 'OpenAI'}`);
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      toast.error(`Failed to summarize: ${error.message}`);
      setShowSummary(false);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleTextView = () => {
    setShowSummary(!showSummary);
  };

  const handleRetryExtraction = () => {
    handleExtractText();
  };

  // Reset state when the modal is closed
  useEffect(() => {
    if (!showTextModal) {
      // We don't reset everything to allow viewing the results again without re-extraction
      setShowSummary(false);
    }
  }, [showTextModal]);

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
    handleRetryExtraction
  };
};
