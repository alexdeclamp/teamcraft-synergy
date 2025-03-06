
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectDocuments from './ProjectDocuments';

interface ProjectDocumentsTabProps {
  projectId: string;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Documents</CardTitle>
        <CardDescription>
          Upload and manage project documents including PDFs, Word files, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectDocuments projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentsTab;
