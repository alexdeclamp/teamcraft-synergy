
import React from 'react';
import ProjectUpdates from './ProjectUpdates';

interface ProjectUpdatesTabProps {
  projectId: string;
}

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({ projectId }) => {
  return (
    <div className="py-4">
      <ProjectUpdates projectId={projectId} />
    </div>
  );
};

export default ProjectUpdatesTab;
