import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  Edit, 
  MoreHorizontal, 
  Settings, 
  Trash2, 
  UserPlus, 
  Users,
  Image 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

interface ProjectHeaderProps {
  project: Project;
  userRole: string | null;
  membersCount: number;
  imagesCount: number;
  daysSinceCreation: number;
  onAddMember: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project, 
  userRole, 
  membersCount, 
  imagesCount, 
  daysSinceCreation,
  onAddMember
}) => {
  const navigate = useNavigate();
  
  const handleDeleteProject = async () => {
    if (!project || userRole !== 'owner') return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast.success("Project deleted successfully");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`font-normal ${userRole === 'owner' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {userRole === 'owner' ? 'Owner' : 'Member'}
            </Badge>
            <Badge variant="outline" className="font-normal bg-purple-100 text-purple-800">
              Active {daysSinceCreation} days
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold">{project?.title}</h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">
            {project?.description || "No description provided"}
          </p>
        </div>
        
        <div className="flex gap-2">
          {userRole === 'owner' && (
            <>
              <Button variant="outline" onClick={onAddMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Project settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleDeleteProject}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>Created: {formatDate(project?.created_at || '')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>Last updated: {formatDate(project?.updated_at || '')}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{membersCount} member{membersCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center">
          <Image className="h-4 w-4 mr-1" />
          <span>{imagesCount} image{imagesCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
