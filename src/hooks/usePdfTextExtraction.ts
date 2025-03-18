import { useState, useEffect, useRef } from 'react';
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
  const extractionAttempts = useRef(0);
  const maxExtractionAttempts = 2;

  const verifyPdfUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('Verifying PDF URL:', url);
      
      try {
        new URL(url);
      } catch (e: any) {
        throw new Error(`Invalid URL format: ${e.message}`);
      }
      
      try {
        const headResponse = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          } 
        });
        
        if (!headResponse.ok) {
          throw new Error(`PDF URL is not accessible: ${headResponse.status} ${headResponse.statusText}`);
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        }
        throw new Error(`Failed to access PDF: ${fetchError.message}`);
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
    extractionAttempts.current = 0;
    
    try {
      const toastId = toast.loading("Extracting text from PDF...", {
        duration: 10000,
      });
      
      console.log('PDF URL to extract:', pdfUrl);
      
      const isUrlValid = await verifyPdfUrl(pdfUrl);
      
      if (!isUrlValid) {
        toast.dismiss(toastId);
        throw new Error('PDF URL is not accessible. Please check the file exists and try again.');
      }
      
      try {
        const info = await getPdfInfo(pdfUrl);
        setPdfInfo(info);
        console.log('PDF info:', info);
        
        if (info.isEncrypted) {
          setDiagnosisInfo('Warning: This PDF appears to be encrypted, which may limit text extraction capabilities.');
        }
      } catch (infoError: any) {
        console.error('Failed to get PDF info:', infoError);
        setDiagnosisInfo(`Info retrieval issue: ${infoError.message}`);
      }
      
      try {
        const result = await extractPdfText(pdfUrl);
        if (result.text && result.text.trim().length > 0) {
          setExtractedText(result.text);
          setPageCount(result.pageCount || 0);
          setTextLength(result.text.length);
          toast.dismiss(toastId);
          toast.success(`Successfully extracted ${result.text.length.toLocaleString()} characters from ${result.pageCount || 0} pages`);
        } else {
          setExtractedText('');
          toast.dismiss(toastId);
          toast.warning("No text content found in the document. It may be an image-based PDF.", {
            description: "Try a different document or one with embedded text content.",
            duration: 5000
          });
        }
      } catch (extractionError: any) {
        console.error('PDF extraction failed:', extractionError);
        setDiagnosisInfo(`Extraction error: ${extractionError.message}`);
        toast.dismiss(toastId);
        throw extractionError;
      }
    } catch (error: any) {
      console.error('Error extracting text:', error);
      const errorMessage = error.message || 'Failed to extract text from the PDF';
      setExtractionError(errorMessage);
      toast.error(`Extraction failed: ${errorMessage}`, {
        description: "If this persists, try downloading the PDF and re-uploading it, or use a different PDF.",
        duration: 5000
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSummarizeText = async (model: SummaryModel = 'claude') => {
    if (!extractedText) {
      toast.error('No text available to summarize', {
        description: "Text must be extracted before it can be summarized.",
      });
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      console.log(`Starting summarization with ${model}...`);
      console.log(`Text length: ${extractedText.length} characters`);
      
      const toastId = toast.loading(`Summarizing text using ${model === 'claude' ? 'Claude' : 'OpenAI'}...`, {
        duration: 30000, // Longer duration for summarization
      });
      
      try {
        const result = await summarizeText({
          text: extractedText,
          model,
          title: fileName,
          projectId,
          maxLength: 2000
        });

        console.log("Summary received:", result ? "success" : "empty");
        
        if (!result) {
          throw new Error("Received empty summary from the service");
        }

        setSummary(result);
        setShowSummary(true);
        toast.dismiss(toastId);
        toast.success(`Text summarized successfully using ${model === 'claude' ? 'Claude' : 'OpenAI'}`);
      } catch (summaryError: any) {
        toast.dismiss(toastId);
        throw summaryError;
      }
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      
      let errorMessage = 'Failed to summarize text';
      let description = '';
      
      if (error.message.includes('token')) {
        errorMessage = 'Text too large to summarize';
        description = 'The document contains too much text for the AI model. Try extracting a smaller portion.';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded';
        description = 'Please wait a moment before trying again. Our AI service has temporary limits.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network issue during summarization';
        description = 'Check your internet connection and try again.';
      } else {
        description = error.message;
      }
      
      toast.error(errorMessage, {
        description: description,
        duration: 6000
      });
      setShowSummary(false);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleTextView = () => {
    setShowSummary(!showSummary);
  };

  const handleRetryExtraction = () => {
    extractionAttempts.current += 1;
    
    if (extractionAttempts.current > maxExtractionAttempts) {
      toast.warning("Multiple extraction attempts detected", {
        description: "If extraction continues to fail, the PDF may be incompatible or corrupted. Try with a different document.",
        duration: 6000
      });
    }
    
    handleExtractText();
  };

  useEffect(() => {
    if (!showTextModal) {
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
    handleRetryExtraction,
    projectId
  };
};
