
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCard, { ProjectCardProps } from '@/components/project-card/ProjectCard';

interface ProjectGridProps {
  projects: ProjectCardProps[];
  loading: boolean;
  searchTerm: string;
  filter: 'all' | 'owned' | 'member' | 'favorites' | 'archived';
  refreshProjects: () => Promise<void>;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ 
  projects, 
  loading, 
  searchTerm, 
  filter,
  refreshProjects
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No brains found</h3>
        <p className="text-muted-foreground mb-6">
          {filter === 'archived' 
            ? 'No archived brains found' 
            : searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first brain'
          }
        </p>
        {!searchTerm && filter === 'all' && (
          <Button 
            onClick={() => navigate('/new-project')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Brain
          </Button>
        )}
      </div>
    );
  }

  return (
    <div id="brain-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          {...project} 
          className="h-full"
          onArchiveStatusChange={refreshProjects}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
