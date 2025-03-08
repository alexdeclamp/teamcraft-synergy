
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UseDocumentUploadProps {
  projectId: string;
  userId: string | undefined;
  onDocumentUploaded?: (document: any) => void;
}

export function useDocumentUpload({ projectId, userId, onDocumentUploaded }: UseDocumentUploadProps) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createNote, setCreateNote] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setErrorMessage(null);
      
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size exceeds 10MB limit');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleCreateNoteChange = (checked: boolean) => {
    setCreateNote(checked);
  };

  const uploadDocument = async () => {
    if (!file || !userId || !projectId) return;
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(20);
      
      // Convert file to base64
      const reader = new FileReader();
      const fileBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      const fileBase64 = await fileBase64Promise;
      setUploadProgress(40);
      
      // Call the extract-pdf-text edge function to process the PDF
      console.log("Calling extract-pdf-text function");
      setUploadProgress(60);
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke(
        'extract-pdf-text',
        {
          body: {
            fileBase64,
            fileName: file.name,
            projectId,
            userId,
            createNote
          }
        }
      );
      
      if (extractionError) {
        console.error('Error calling extract-pdf-text function:', extractionError);
        throw new Error(`Extraction failed: ${extractionError.message}`);
      }
      
      if (!extractionData || !extractionData.success) {
        console.error('Extraction function returned error:', extractionData?.error || 'Unknown error');
        throw new Error(extractionData?.error || 'Unknown error occurred during PDF processing');
      }
      
      setUploadProgress(100);
      console.log("PDF processed successfully:", extractionData);
      
      if (extractionData.textExtracted) {
        toast.success('PDF uploaded and text extracted successfully');
      } else {
        toast.success('PDF uploaded successfully, but no text could be extracted');
      }
      
      if (onDocumentUploaded && extractionData.document) {
        onDocumentUploaded(extractionData.document);
      }
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setErrorMessage(error.message || 'Unknown error occurred');
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setErrorMessage(null);
    setCreateNote(false);
    const inputElement = document.getElementById('pdf-upload') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  };

  return {
    file,
    isUploading,
    uploadProgress,
    errorMessage,
    createNote,
    handleFileChange,
    handleCreateNoteChange,
    uploadDocument,
    resetForm
  };
}
