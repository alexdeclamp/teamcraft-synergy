
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectNotesComponent from '@/components/ProjectNotes';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ProjectNotesTabProps {
  projectId: string;
}

const ProjectNotesTab: React.FC<ProjectNotesTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Project Notes</CardTitle>
          <CardDescription>
            Capture and organize your project ideas and information
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectNotesComponent projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectNotesTab;
