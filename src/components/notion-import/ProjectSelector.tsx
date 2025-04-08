
import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProjectSelectorProps {
  userProjects: any[];
  selectedProject: string | null;
  setSelectedProject: (projectId: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  userProjects, 
  selectedProject, 
  setSelectedProject 
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Select Project
      </label>
      <select 
        className="w-full p-2 border rounded-md bg-background"
        value={selectedProject || ''}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        <option value="">-- Select a project --</option>
        {userProjects.map(project => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
      {!selectedProject && (
        <p className="text-sm text-amber-600 mt-1">
          Please select a project to import notes into
        </p>
      )}
      {userProjects.length === 0 && (
        <p className="text-sm text-red-500 mt-1">
          No projects found. Please create a project first from the dashboard.
        </p>
      )}
      
      {userProjects.length === 0 && (
        <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
          <h3 className="text-amber-800 font-medium">No Projects Available</h3>
          <p className="text-amber-700 mt-1">
            You need to create a project first before you can import Notion pages.
          </p>
          <Button 
            variant="default" 
            onClick={() => navigate('/dashboard')}
            className="mt-3"
          >
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
