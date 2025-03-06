
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProjectUpdates from './ProjectUpdates';

interface ProjectUpdatesTabProps {
  projectId: string;
}

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ProjectUpdates projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectUpdatesTab;
