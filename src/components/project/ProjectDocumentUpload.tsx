
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDocumentUploadProps {
  projectId: string;
  onDocumentUploaded?: (document: any) => void;
}

const ProjectDocumentUpload: React.FC<ProjectDocumentUploadProps> = ({ projectId, onDocumentUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

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

  const uploadDocument = async () => {
    if (!file || !user || !projectId) return;
    
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
            userId: user.id
          });
          
          const { data, error } = await supabase.functions.invoke('summarize-pdf', {
            body: {
              fileBase64: event.target.result,
              fileName: file.name,
              projectId,
              userId: user.id
            }
          });
          
          console.log("Edge function response:", data, error);
          
          if (error) {
            console.error('Edge function error:', error);
            throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
          }
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setUploadProgress(90);
          
          toast.success(`PDF uploaded successfully`);
          setUploadProgress(100);
          
          if (onDocumentUploaded && data.document) {
            onDocumentUploaded(data.document);
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

  return (
    <div className="bg-accent/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="font-medium text-lg">Upload PDF</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-full">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-primary/10 file:text-primary hover:file:cursor-pointer w-full"
            />
          </div>
          <Button 
            onClick={uploadDocument} 
            disabled={!file || isUploading}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </>
            )}
          </Button>
        </div>
        
        {file && (
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span className="truncate max-w-[300px]">{file.name}</span>
            <span className="ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {uploadProgress < 30 && "Reading file..."}
              {uploadProgress >= 30 && uploadProgress < 90 && "Uploading file..."}
              {uploadProgress >= 90 && "Finalizing..."}
            </p>
          </div>
        )}
        
        {uploadProgress === 100 && !isUploading && (
          <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm flex items-start">
            <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>File uploaded successfully</div>
          </div>
        )}
        
        {uploadProgress === 100 && !isUploading && (
          <Button variant="outline" size="sm" onClick={resetForm}>
            Upload Another PDF
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentUpload;
