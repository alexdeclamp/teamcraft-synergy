
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StickyNote, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectNotesComponent from '@/components/ProjectNotes';

interface ProjectNotesTabProps {
  projectId: string;
}

const ProjectNotesTab: React.FC<ProjectNotesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ProjectNotesComponent projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectNotesTab;
