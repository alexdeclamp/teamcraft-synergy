
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProjectLayoutError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Project not found</h2>
      <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
      <Button onClick={() => navigate('/dashboard')}>
        Back to Projects
      </Button>
    </div>
  );
};

export default ProjectLayoutError;
