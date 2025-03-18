
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, UserPlus, Archive, Star, ArchiveRestore, Trash, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  isFavorite,
  setFavorite,
  isArchived = false,
  onArchiveStatusChange,
  userRole = isOwner ? 'owner' : 'member'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMember = userRole === 'admin' || userRole === 'editor' || userRole === 'viewer';

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
      
      toast.success(isArchived ? 'Brain restored successfully' : 'Brain archived successfully');
      
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Brain deleted successfully');
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error deleting brain:', error);
      toast.error('Failed to delete brain');
    }
  };

  const handleQuitBrain = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isMember || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to leave this brain? You'll need to be invited again to rejoin."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('You have left the brain');
      
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } catch (error) {
      console.error('Error leaving brain:', error);
      toast.error('Failed to leave brain');
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newFavoriteStatus = !isFavorite;
      
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setFavorite(newFavoriteStatus);
      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={cn(
            "h-5 w-5 transition-colors",
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {!isArchived && (
            <>
              <DropdownMenuItem onClick={handleEditBrain}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit brain
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageMembers}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage members
              </DropdownMenuItem>
            </>
          )}
          
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleArchiveToggle}
                className={isArchived ? "text-green-600" : "text-destructive"}
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore brain
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive brain
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteBrain}
                className="text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete brain
              </DropdownMenuItem>
            </>
          )}
          
          {isMember && !isOwner && (
            <DropdownMenuItem onClick={handleQuitBrain}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave brain
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectCardActions;
