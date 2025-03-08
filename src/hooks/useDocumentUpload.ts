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
    // Keeping this method for interface compatibility
  };

  const uploadDocument = async () => {
    if (!file || !userId || !projectId) return;
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(20);
      
      // Define file path in storage
      const timestamp = new Date().getTime();
      const pdfPath = `${userId}/${projectId}/${timestamp}_${file.name}`;
      const bucketName = 'project_documents';
      
      // Upload the PDF file directly to Supabase Storage
      setUploadProgress(40);
      console.log(`Uploading PDF to storage: ${pdfPath}`);
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(pdfPath, file, {
          contentType: 'application/pdf',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      setUploadProgress(70);
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(pdfPath);
      
      // Save document info in the database
      setUploadProgress(85);
      console.log("Saving document info to database");
      
      const { data: documentData, error: documentError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          user_id: userId,
          file_name: file.name,
          file_url: publicUrl,
          file_path: pdfPath,
          document_type: 'pdf',
          file_size: file.size,
          metadata: {
            pdf_url: publicUrl
          }
        })
        .select()
        .single();
      
      if (documentError) {
        console.error('Error saving document to database:', documentError);
        throw new Error(`Database error: ${documentError.message}`);
      }
      
      setUploadProgress(100);
      toast.success('PDF uploaded successfully');
      
      if (onDocumentUploaded && documentData) {
        onDocumentUploaded(documentData);
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
    createNote: false, // Always return false for createNote
    handleFileChange,
    handleCreateNoteChange, // Keep for interface compatibility
    uploadDocument,
    resetForm
  };
}
