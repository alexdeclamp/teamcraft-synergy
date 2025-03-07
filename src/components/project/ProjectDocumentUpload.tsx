
import React from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { DocumentUploadForm } from './document/DocumentUploadForm';
import { DocumentUploadStatus } from './document/DocumentUploadStatus';

interface ProjectDocumentUploadProps {
  projectId: string;
  onDocumentUploaded?: (document: any) => void;
}

const ProjectDocumentUpload: React.FC<ProjectDocumentUploadProps> = ({ 
  projectId, 
  onDocumentUploaded
}) => {
  const { user } = useAuth();
  const {
    file,
    isUploading,
    uploadProgress,
    errorMessage,
    handleFileChange,
    uploadDocument,
    resetForm
  } = useDocumentUpload({
    projectId,
    userId: user?.id,
    onDocumentUploaded
  });

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
        <FileText className="h-5 w-5" />
        <h3 className="font-medium text-lg">Upload PDF</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <DocumentUploadForm 
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onUpload={uploadDocument}
        />
        
        <DocumentUploadStatus
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          errorMessage={errorMessage}
          onReset={resetForm}
        />
      </div>
    </div>
  );
};

export default ProjectDocumentUpload;
