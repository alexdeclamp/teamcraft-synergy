
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, UserPlus, Archive, ArchiveRestore, Trash, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardActionsProps {
  id: string;
  isOwner?: boolean;
  isFavorite: boolean;
  setFavorite: (state: boolean) => void;
  isArchived?: boolean;
  onArchiveStatusChange?: () => void;
  userRole?: string;
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  id,
  isOwner,
  isArchived = false,
  onArchiveStatusChange,
  userRole = isOwner ? 'owner' : 'member'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMember = userRole === 'member' || userRole === 'admin' || userRole === 'editor' || userRole === 'viewer';

  const handleEditBrain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/project/${id}?edit=true`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/project/${id}?tab=members`);
  };

  const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_archived: !isArchived,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(isArchived ? 'Brain restored' : 'Brain archived');
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update brain');
    }
  };

  const handleDeleteBrain = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this brain? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      toast.loading('Deleting brain...');
      
      // Delete associated data
      await Promise.all([
        supabase.from('image_summaries').delete().eq('project_id', id),
        supabase.from('note_summaries').delete().eq('project_id', id),
        supabase.from('image_tags').delete().eq('project_id', id),
        supabase.from('project_documents').delete().eq('project_id', id),
        supabase.from('project_notes').delete().eq('project_id', id),
        supabase.from('project_updates').delete().eq('project_id', id),
        supabase.from('project_members').delete().eq('project_id', id),
      ]);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.dismiss();
      toast.success('Brain deleted');
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error deleting brain:', error);
      toast.error('Failed to delete brain');
    }
  };

  const handleQuitBrain = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isMember || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to leave this brain?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left brain');
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error leaving brain:', error);
      toast.error('Failed to leave brain');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {!isArchived && (
          <>
            <DropdownMenuItem onClick={handleEditBrain}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleManageMembers}>
              <UserPlus className="h-4 w-4 mr-2" />
              Members
            </DropdownMenuItem>
          </>
        )}
        
        {isOwner && (
          <>
            {!isArchived && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleArchiveToggle}>
              {isArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteBrain}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
        
        {isMember && !isOwner && (
          <DropdownMenuItem onClick={handleQuitBrain}>
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectCardActions;
