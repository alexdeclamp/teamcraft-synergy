
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
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
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
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
      setUploadProgress(10);
      
      // Convert file to base64
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('Failed to read file');
          }
          
          setUploadProgress(30);
          
          // Send file to edge function for processing
          const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
            body: {
              fileBase64: event.target.result,
              fileName: file.name,
              projectId,
              userId: user.id
            }
          });
          
          setUploadProgress(90);
          
          if (error) {
            throw error;
          }
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          toast.success(`PDF processed with ${data.textLength} characters extracted`);
          setUploadProgress(100);
          
          if (onDocumentUploaded && data.document) {
            onDocumentUploaded(data.document);
          }
          
          // Reset the form
          setFile(null);
          const inputElement = document.getElementById('pdf-upload') as HTMLInputElement;
          if (inputElement) {
            inputElement.value = '';
          }
          
        } catch (err: any) {
          console.error('Error processing PDF:', err);
          toast.error(`Failed to process PDF: ${err.message || 'Unknown error'}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      fileReader.onerror = () => {
        toast.error('Failed to read file');
        setIsUploading(false);
      };
      
      fileReader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload a PDF document to extract text for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-primary/10 file:text-primary hover:file:cursor-pointer"
            />
            <Button 
              onClick={uploadDocument} 
              disabled={!file || isUploading}
              className="whitespace-nowrap"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
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
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress < 30 && "Reading file..."}
                {uploadProgress >= 30 && uploadProgress < 90 && "Extracting text from PDF..."}
                {uploadProgress >= 90 && "Finalizing..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentUpload;
