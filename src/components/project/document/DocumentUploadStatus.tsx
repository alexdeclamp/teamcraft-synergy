
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText } from 'lucide-react';

interface DocumentUploadStatusProps {
  isUploading: boolean;
  uploadProgress: number;
  errorMessage: string | null;
  onReset: () => void;
}

export const DocumentUploadStatus: React.FC<DocumentUploadStatusProps> = ({
  isUploading,
  uploadProgress,
  errorMessage,
  onReset
}) => {
  return (
    <div className="space-y-4">
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
            {uploadProgress >= 30 && uploadProgress < 60 && "Processing PDF..."}
            {uploadProgress >= 60 && uploadProgress < 90 && uploadProgress > 30 && "Generating note..."}
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
        <Button variant="outline" size="sm" onClick={onReset}>
          Upload Another PDF
        </Button>
      )}
    </div>
  );
};
