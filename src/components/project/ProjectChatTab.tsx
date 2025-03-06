
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ProjectChat from '@/components/ProjectChat';

interface ProjectChatTabProps {
  projectId: string;
  projectTitle?: string;
  aiPersona?: string;
}

const ProjectChatTab: React.FC<ProjectChatTabProps> = ({ 
  projectId,
  projectTitle,
  aiPersona
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
        <CardDescription>
          Chat with AI about this project
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ProjectChat projectId={projectId} />
      </CardContent>
    </Card>
  );
};

export default ProjectChatTab;
