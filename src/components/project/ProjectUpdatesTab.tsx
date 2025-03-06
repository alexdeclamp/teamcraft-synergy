
import React from 'react';
import ProjectUpdates from './ProjectUpdates';

interface ProjectUpdatesTabProps {
  projectId: string;
}

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({ projectId }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Project Updates</h2>
      <p className="text-muted-foreground">Share updates and progress with your team.</p>
      <ProjectUpdates projectId={projectId} />
    </div>
  );
};

export default ProjectUpdatesTab;
