
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectDocuments from './ProjectDocuments';

interface ProjectDocumentsTabProps {
  projectId: string;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ projectId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brain Documents</h2>
          <p className="text-muted-foreground">
            Upload and manage PDF documents for your brain
          </p>
        </div>
      </div>

      <ProjectDocuments projectId={projectId} />
    </div>
  );
};

export default ProjectDocumentsTab;
