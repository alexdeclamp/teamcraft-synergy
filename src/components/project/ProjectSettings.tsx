
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface ProjectSettingsProps {
  projectId: string;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>
          Configure project preferences and options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Project settings are coming soon</p>
          <p className="text-sm text-muted-foreground">Check back later for options to customize your project</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSettings;
