
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
    files,
    isUploading,
    uploadProgress,
    errorMessage,
    createNote,
    currentFileIndex,
    totalFiles,
    handleFilesChange,
    handleCreateNoteChange,
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
        <h3 className="font-medium text-lg">Upload PDFs</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <DocumentUploadForm 
          files={files}
          isUploading={isUploading}
          createNote={createNote}
          onFilesChange={handleFilesChange}
          onCreateNoteChange={handleCreateNoteChange}
          onUpload={uploadDocument}
        />
        
        <DocumentUploadStatus
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          errorMessage={errorMessage}
          onReset={resetForm}
          currentFileIndex={currentFileIndex}
          totalFiles={totalFiles}
        />
      </div>
    </div>
  );
};

export default ProjectDocumentUpload;
