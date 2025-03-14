
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
import { MoreHorizontal, Edit, Archive, ArchiveRestore } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectActionsMenuProps {
  projectId: string;
  userRole: string | null;
  onEdit?: () => void;
  isArchived?: boolean;
  onArchiveStatusChange?: () => void;
}

const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({ 
  projectId, 
  userRole,
  onEdit,
  isArchived = false,
  onArchiveStatusChange
}) => {
  const navigate = useNavigate();
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  
  const handleArchiveToggle = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          is_archived: !isArchived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      toast.success(isArchived ? 'Brain restored successfully' : 'Brain archived successfully');
      
      // Call the callback to refresh the project list
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update brain');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {onEdit && !isArchived && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Brain
          </DropdownMenuItem>
        )}
        
        {isOwnerOrAdmin && !isArchived && <DropdownMenuSeparator />}
        
        {isOwnerOrAdmin && (
          <DropdownMenuItem 
            className={isArchived ? "text-green-600 focus:text-green-600" : "text-destructive focus:text-destructive"}
            onClick={handleArchiveToggle}
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Restore Brain
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Archive Brain
              </>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectActionsMenu;
