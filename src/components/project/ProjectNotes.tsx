
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotesComponent from '@/components/ProjectNotes';

interface ProjectNotesTabProps {
  projectId: string;
}

const ProjectNotesTab: React.FC<ProjectNotesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
        <CardDescription>
          Capture and organize your project ideas and information
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectNotesComponent projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectNotesTab;
