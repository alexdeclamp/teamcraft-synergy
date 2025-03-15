
import { useState } from 'react';

export const usePdfVerification = () => {
  const [diagnosisInfo, setDiagnosisInfo] = useState<string | null>(null);

  const verifyPdfUrl = async (url: string): Promise<boolean> => {
    try {
      console.log('Verifying PDF URL:', url);
      
      // Validate URL format
      try {
        new URL(url);
      } catch (e: any) {
        throw new Error(`Invalid URL format: ${e.message}`);
      }
      
      // Check if the URL is accessible with a HEAD request
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

  return {
    diagnosisInfo,
    setDiagnosisInfo,
    verifyPdfUrl
  };
};
