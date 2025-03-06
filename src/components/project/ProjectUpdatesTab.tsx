
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectUpdates from './ProjectUpdates';

interface ProjectUpdatesTabProps {
  projectId: string;
}

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Updates</CardTitle>
        <CardDescription>
          Share updates and progress with your team
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectUpdates projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectUpdatesTab;
