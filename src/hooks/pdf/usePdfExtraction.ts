
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { extractPdfText, getPdfInfo } from '@/utils/pdfUtils';
import { usePdfVerification } from './usePdfVerification';

interface UsePdfExtractionProps {
  pdfUrl: string;
  fileName: string;
}

export const usePdfExtraction = ({ pdfUrl, fileName }: UsePdfExtractionProps) => {
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfInfo, setPdfInfo] = useState<{pageCount: number; isEncrypted: boolean; fingerprint: string} | null>(null);
  const [textLength, setTextLength] = useState(0);
  const extractionAttempts = useRef(0);
  const maxExtractionAttempts = 2;
  
  const { verifyPdfUrl, diagnosisInfo, setDiagnosisInfo } = usePdfVerification();

  const handleExtractText = async () => {
    setIsExtracting(true);
    setExtractionError(null);
    setDiagnosisInfo(null);
    setPdfInfo(null);
    setExtractedText('');
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
      
      // Get PDF info
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
      
      // Extract text from PDF
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

  return {
    extractedText,
    isExtracting,
    extractionError,
    pageCount,
    diagnosisInfo,
    pdfInfo,
    textLength,
    handleExtractText,
    handleRetryExtraction
  };
};
