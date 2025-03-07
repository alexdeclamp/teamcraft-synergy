
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
  const [createNote, setCreateNote] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setErrorMessage(null);
      
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // Reduced to 5MB limit
        toast.error('File size exceeds 5MB limit for edge function processing');
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
      setUploadProgress(10);
      
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('Failed to read file');
          }
          
          setUploadProgress(30);
          console.log("Calling edge function with params:", {
            fileSize: file.size,
            fileName: file.name,
            projectId,
            userId,
            createNote
          });
          
          // Set a timeout for the edge function call
          let edgeFunctionResponse: any = null;
          let edgeFunctionError: any = null;
          
          try {
            // Define a promise that will be rejected after timeout
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
            });
            
            // Create the supabase function invoke promise
            const functionPromise = supabase.functions.invoke('extract-pdf-text', {
              body: {
                fileBase64: event.target.result,
                fileName: file.name,
                projectId,
                userId,
                createNote
              }
            });
            
            // Race between the function call and the timeout
            edgeFunctionResponse = await Promise.race([functionPromise, timeoutPromise]);
          } catch (err: any) {
            console.error('Edge function call error:', err);
            edgeFunctionError = err;
          }
          
          if (edgeFunctionError) {
            throw new Error(`Upload failed: ${edgeFunctionError.message || 'Unknown error'}`);
          }
          
          const { data, error } = edgeFunctionResponse || { data: null, error: null };
          
          console.log("Edge function response:", data, error);
          
          if (error) {
            console.error('Edge function error:', error);
            throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
          }
          
          if (data?.error) {
            throw new Error(data.error);
          }
          
          setUploadProgress(90);
          
          let successMessage = `PDF uploaded successfully`;
          if (data?.noteId) {
            successMessage += ` and note created`;
          }
          
          toast.success(successMessage);
          setUploadProgress(100);
          
          if (onDocumentUploaded && data?.document) {
            onDocumentUploaded(data.document);
          }
          
          if (data?.noteId) {
            setTimeout(() => {
              navigate(`/project/${projectId}/notes/${data.noteId}`);
            }, 1500);
          }
          
        } catch (err: any) {
          console.error('Error processing PDF:', err);
          setErrorMessage(err.message || 'Unknown error occurred');
          toast.error(`Failed to process PDF: ${err.message || 'Unknown error'}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      fileReader.onerror = (event) => {
        console.error('FileReader error:', event);
        toast.error('Failed to read file');
        setIsUploading(false);
        setErrorMessage('Failed to read file');
      };
      
      fileReader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setErrorMessage(error.message || 'Unknown error occurred');
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
    createNote,
    handleFileChange,
    handleCreateNoteChange,
    uploadDocument,
    resetForm
  };
}
