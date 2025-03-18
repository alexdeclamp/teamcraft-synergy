
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
import { MoreHorizontal, Edit, Archive, ArchiveRestore, Trash } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';
  
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
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update brain');
    }
  };

  const handleDeleteBrain = async () => {
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this brain? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Brain deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting brain:', error);
      toast.error('Failed to delete brain');
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

        {isOwner && (
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={handleDeleteBrain}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Brain
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectActionsMenu;
