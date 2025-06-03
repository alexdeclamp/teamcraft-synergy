
import React from 'react';
import { Loader2 } from 'lucide-react';

const ProjectLayoutLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ProjectLayoutLoading;
