
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Edit, Archive } from "lucide-react";

interface ProjectActionsMenuProps {
  projectId: string;
  userRole: string | null;
  onEdit?: () => void;
}

const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({ 
  projectId, 
  userRole,
  onEdit
}) => {
  const navigate = useNavigate();
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </DropdownMenuItem>
        )}
        
        {isOwnerOrAdmin && (
          <>
            <DropdownMenuItem onClick={() => navigate(`/projects/${projectId}/settings`)}>
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // This would be implemented in a future update
                console.log('Archive project');
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectActionsMenu;
