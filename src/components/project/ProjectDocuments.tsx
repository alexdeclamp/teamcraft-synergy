
import React from 'react';
import { useProjectDocuments } from '@/hooks/useProjectDocuments';
import ProjectDocumentUpload from './ProjectDocumentUpload';
import { DocumentsList } from './document/DocumentsList';

interface ProjectDocumentsProps {
  projectId: string;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId }) => {
  const {
    documents,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleDocumentUploaded
  } = useProjectDocuments(projectId);

  return (
    <div className="space-y-6">
      <ProjectDocumentUpload 
        projectId={projectId} 
        onDocumentUploaded={handleDocumentUploaded}
      />
      
      <DocumentsList
        documents={documents}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={fetchDocuments}
      />
    </div>
  );
};

export default ProjectDocuments;
