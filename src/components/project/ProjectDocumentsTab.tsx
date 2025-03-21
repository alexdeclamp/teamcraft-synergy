
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
      <div className="grid grid-cols-1 gap-6">
        <FeatureAccess feature="canUploadDocuments">
          <ProjectDocuments projectId={projectId} />
        </FeatureAccess>
      </div>
    </div>
  );
};

export default ProjectDocumentsTab;
