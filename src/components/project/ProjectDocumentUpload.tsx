import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
  const [convertedImages, setConvertedImages] = useState<Array<{page: number, url: string}>>([]);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setErrorMessage(null);
      setConvertedImages([]);
      
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
      setConvertedImages([]);
      
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('Failed to read file');
          }
          
          setUploadProgress(20);
          console.log("Calling edge function with params:", {
            fileSize: file.size,
            fileName: file.name,
            projectId,
            userId: user.id
          });
          
          const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
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
            throw new Error(`Processing failed: ${error.message || 'Unknown error'}`);
          }
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setUploadProgress(90);
          
          if (data.images && Array.isArray(data.images)) {
            setConvertedImages(data.images);
          }
          
          toast.success(`PDF converted to ${data.pages || 0} image(s) successfully`);
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
    setConvertedImages([]);
    setErrorMessage(null);
    const inputElement = document.getElementById('pdf-upload') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Convert PDF to Images
        </CardTitle>
        <CardDescription>
          Upload a PDF document to convert it to images
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
                  Converting
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Convert
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
                {uploadProgress < 20 && "Reading file..."}
                {uploadProgress >= 20 && uploadProgress < 90 && "Converting PDF to images..."}
                {uploadProgress >= 90 && "Finalizing..."}
              </p>
            </div>
          )}
          
          {convertedImages.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Converted Images ({convertedImages.length})
                </h3>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Upload Another PDF
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                {convertedImages.map((image, index) => (
                  <div key={index} className="border rounded-md overflow-hidden shadow-sm">
                    <div className="p-2 bg-muted text-sm font-medium">
                      Page {image.page}
                    </div>
                    <a href={image.url} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={image.url} 
                        alt={`Page ${image.page}`} 
                        className="w-full h-auto object-contain hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentUpload;
