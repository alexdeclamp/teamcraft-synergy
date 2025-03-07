
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  metadata?: {
    pdf_url?: string;
    extractedInfoNoteId?: string;
  };
}

export const usePdfExtraction = (document: Document, projectId: string) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState('');
  const { user } = useAuth();

  const extractInformation = async () => {
    if (!document || !user) return;

    try {
      setIsExtracting(true);
      setExtractedInfo('');

      // Determine which URL to use (either direct PDF or from metadata)
      const pdfUrl = document.metadata?.pdf_url || document.file_url;
      
      if (!pdfUrl) {
        throw new Error('No PDF URL available for this document');
      }

      console.log('Extracting information from PDF:', pdfUrl);
      console.log('Document ID:', document.id);
      console.log('Project ID:', projectId);
      console.log('User ID:', user.id);

      // Call the edge function to extract information using Claude
      const { data, error } = await supabase.functions.invoke('extract-pdf-info', {
        body: {
          pdfUrl,
          documentId: document.id,
          projectId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to extract information: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from function');
        throw new Error('No data returned from function');
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(`Failed to extract information: ${data.error}`);
      }

      if (data.summary) {
        setExtractedInfo(data.summary);
        toast.success('Successfully extracted information from PDF');
      } else {
        console.error('No summary returned from function:', data);
        throw new Error('No information was extracted');
      }
    } catch (error: any) {
      console.error('Error extracting PDF information:', error);
      toast.error(error.message || 'Failed to extract information from PDF');
      setExtractedInfo('Failed to extract information. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    isExtracting,
    extractedInfo,
    extractInformation
  };
};
