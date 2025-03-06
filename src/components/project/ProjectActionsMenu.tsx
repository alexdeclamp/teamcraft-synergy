
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Edit, Archive, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ProjectActionsMenuProps {
  projectId: string;
  userRole: string | null;
  project: {
    id: string;
    title: string;
    description?: string | null;
    is_favorite?: boolean;
    is_archived?: boolean;
  };
  onEdit?: () => void;
  onFavoriteToggle?: () => Promise<void>;
  onArchiveToggle?: () => Promise<void>;
}

const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({ 
  projectId, 
  userRole,
  project,
  onEdit,
  onFavoriteToggle,
  onArchiveToggle
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  
  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      setTitle(project?.title || '');
      setDescription(project?.description || '');
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = async () => {
    // This is just a stub - actual implementation would save to the database
    toast({
      title: "Project updated",
      description: "The project details have been updated successfully."
    });
    setShowEditDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onFavoriteToggle}>
            <Star className={`h-4 w-4 mr-2 ${project?.is_favorite ? 'text-yellow-500' : ''}`} />
            {project?.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </DropdownMenuItem>
          
          {isOwnerOrAdmin && (
            <>
              <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/settings`)}>
                <Settings className="h-4 w-4 mr-2" />
                Project Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={onArchiveToggle}
              >
                <Archive className="h-4 w-4 mr-2" />
                {project?.is_archived ? 'Unarchive Project' : 'Archive Project'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Project Title</label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectActionsMenu;
