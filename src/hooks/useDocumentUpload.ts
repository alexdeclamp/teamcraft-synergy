
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
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const handleFilesChange = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }
      
      if (file.size > 25 * 1024 * 1024) { // 25MB limit (increased from 10MB)
        toast.error(`${file.name} exceeds 25MB limit`);
        return false;
      }
      
      return true;
    });
    
    setFiles(validFiles);
    setErrorMessage(null);
  };

  const handleCreateNoteChange = (checked: boolean) => {
    // Keeping this method for interface compatibility
  };

  const uploadDocument = async () => {
    if (files.length === 0 || !userId || !projectId) return;
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      setTotalFiles(files.length);
      
      // Upload each file in sequence
      const uploadedDocuments = [];
      
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        const file = files[i];
        
        // Define file path in storage - sanitize filename to avoid special characters issues
        const timestamp = new Date().getTime();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const pdfPath = `${userId}/${projectId}/${timestamp}_${sanitizedFileName}`;
        const bucketName = 'project_documents';
        
        // Update progress for current file
        setUploadProgress(20);
        console.log(`Uploading PDF to storage (${i+1}/${files.length}): ${pdfPath}`);
        
        // Upload the PDF file directly to Supabase Storage
        setUploadProgress(40);
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(bucketName)
          .upload(pdfPath, file, {
            contentType: 'application/pdf',
            upsert: false
          });
        
        if (uploadError) {
          console.error(`Error uploading file ${file.name} to storage:`, uploadError);
          
          // Provide more detailed error messages based on error type
          let errorMsg = `Failed to upload ${file.name}`;
          if (uploadError.message.includes('Invalid key')) {
            errorMsg += ': The filename contains characters that are not allowed. Try renaming the file.';
          } else if (uploadError.message.includes('already exists')) {
            errorMsg += ': A file with this name already exists.';
          } else if (uploadError.message.includes('size limit')) {
            errorMsg += ': The file exceeds the maximum size limit.';
          } else {
            errorMsg += `: ${uploadError.message}`;
          }
          
          toast.error(errorMsg);
          continue; // Continue with next file even if this one fails
        }
        
        setUploadProgress(70);
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(pdfPath);
        
        // Save document info in the database
        setUploadProgress(85);
        console.log(`Saving document info to database for ${file.name}`);
        
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
          console.error(`Error saving document ${file.name} to database:`, documentError);
          toast.error(`Database error for ${file.name}: ${documentError.message}`);
          continue; // Continue with next file even if this one fails
        }
        
        uploadedDocuments.push(documentData);
        setUploadProgress(100);
      }
      
      // Notify about completed uploads
      if (uploadedDocuments.length === files.length) {
        toast.success(`${files.length} PDF${files.length > 1 ? 's' : ''} uploaded successfully`);
      } else if (uploadedDocuments.length > 0) {
        toast.success(`${uploadedDocuments.length} of ${files.length} PDFs uploaded successfully`);
      } else {
        toast.error('Failed to upload any PDFs');
      }
      
      // Call the callback with the last uploaded document or all documents
      if (onDocumentUploaded && uploadedDocuments.length > 0) {
        // Notify about each uploaded document
        uploadedDocuments.forEach(doc => {
          onDocumentUploaded(doc);
        });
      }
      
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setErrorMessage(error.message || 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setErrorMessage(null);
    const inputElement = document.getElementById('pdf-upload') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  };

  return {
    files,
    isUploading,
    uploadProgress,
    errorMessage,
    createNote: false, // Always return false for createNote
    currentFileIndex,
    totalFiles,
    handleFilesChange,
    handleCreateNoteChange, // Keep for interface compatibility
    uploadDocument,
    resetForm
  };
}
