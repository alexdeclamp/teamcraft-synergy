
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';

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
          <div>
            <p className="font-medium mb-1">Error uploading document</p>
            <p>{errorMessage}</p>
            <p className="mt-2 text-xs">If this error persists, please try again or check your network connection.</p>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="space-y-3">
          <Progress value={uploadProgress} className="h-2" />
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              {uploadProgress < 40 && "Preparing file..."}
              {uploadProgress >= 40 && uploadProgress < 70 && "Uploading PDF..."}
              {uploadProgress >= 70 && uploadProgress < 90 && "Saving document..."}
              {uploadProgress >= 90 && "Finalizing..."}
            </p>
          </div>
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
