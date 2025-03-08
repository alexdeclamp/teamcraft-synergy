
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
      
      // Upload the file directly to storage first
      const timestamp = new Date().getTime();
      const filePath = `${userId}/${projectId}/${timestamp}_${file.name}`;
      
      // Extract base64 data
      const base64Data = fileBase64.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('project_documents')
        .upload(filePath, binaryData, {
          contentType: 'application/pdf',
          upsert: false
        });
        
      if (uploadError) {
        throw new Error(`Storage upload error: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('project_documents')
        .getPublicUrl(filePath);
      
      setUploadProgress(60);
      
      // Create a document record in the database
      const { data: documentData, error: documentError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          user_id: userId,
          file_name: file.name,
          file_url: publicUrl,
          file_path: filePath,
          document_type: 'pdf',
          file_size: file.size,
          metadata: {
            pdf_url: publicUrl
          }
        })
        .select()
        .single();
        
      if (documentError) {
        throw new Error(`Database error: ${documentError.message}`);
      }
      
      setUploadProgress(75);
      
      // Optionally start text extraction in the background
      if (createNote) {
        console.log("Calling extract-pdf-text function for background processing");
        setUploadProgress(85);
        
        // This will run in the background but we won't wait for it
        supabase.functions.invoke(
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
        ).then(({ data, error }) => {
          if (error) {
            console.error('Background extraction error:', error);
            toast.error('Background document processing encountered an error, but the document was uploaded successfully');
          } else if (data?.noteId) {
            toast.success('PDF summary note was created successfully');
          }
        });
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
