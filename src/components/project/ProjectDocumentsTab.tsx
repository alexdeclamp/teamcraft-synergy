
import React from 'react';
import ProjectDocumentUpload from './ProjectDocumentUpload';
import ProjectDocuments from './ProjectDocuments';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import FeatureAccess from '../feature/FeatureAccess';

interface ProjectDocumentsTabProps {
  projectId: string;
  userRole: string | null;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ projectId, userRole }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectDocuments projectId={projectId} />
        </div>
        
        <div className="lg:col-span-1">
          <FeatureAccess feature="canUploadDocuments">
            <ProjectDocumentUpload projectId={projectId} />
          </FeatureAccess>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsTab;
