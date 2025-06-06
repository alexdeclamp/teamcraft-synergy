
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
import { MoreHorizontal, Edit, Archive, ArchiveRestore, Trash, LogOut } from "lucide-react";
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
  const isMember = userRole === 'member' || userRole === 'admin' || userRole === 'editor' || userRole === 'viewer';
  
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
      toast.loading('Deleting brain and related data...');
      
      // Delete associated data first - image_summaries
      const { error: imageSummaryError } = await supabase
        .from('image_summaries')
        .delete()
        .eq('project_id', projectId);
        
      if (imageSummaryError) {
        console.warn('Error deleting image summaries:', imageSummaryError);
      }
      
      // Delete associated note summaries
      const { error: noteSummaryError } = await supabase
        .from('note_summaries')
        .delete()
        .eq('project_id', projectId);
        
      if (noteSummaryError) {
        console.warn('Error deleting note summaries:', noteSummaryError);
      }
      
      // Delete associated image tags
      const { error: imageTagsError } = await supabase
        .from('image_tags')
        .delete()
        .eq('project_id', projectId);
        
      if (imageTagsError) {
        console.warn('Error deleting image tags:', imageTagsError);
      }
      
      // Delete project documents
      const { error: documentsError } = await supabase
        .from('project_documents')
        .delete()
        .eq('project_id', projectId);
        
      if (documentsError) {
        console.warn('Error deleting project documents:', documentsError);
      }
      
      // Delete project notes
      const { error: notesError } = await supabase
        .from('project_notes')
        .delete()
        .eq('project_id', projectId);
        
      if (notesError) {
        console.warn('Error deleting project notes:', notesError);
      }
      
      // Delete project updates
      const { error: updatesError } = await supabase
        .from('project_updates')
        .delete()
        .eq('project_id', projectId);
        
      if (updatesError) {
        console.warn('Error deleting project updates:', updatesError);
      }
      
      // Delete project members
      const { error: membersError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId);
        
      if (membersError) {
        console.warn('Error deleting project members:', membersError);
      }
      
      // Finally delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.dismiss();
      toast.success('Brain deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.dismiss();
      console.error('Error deleting brain:', error);
      toast.error('Failed to delete brain');
    }
  };

  const handleQuitBrain = async () => {
    if (!isMember || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to leave this brain? You'll need to be invited again to rejoin."
    );

    if (!confirmed) return;

    try {
      console.log('Attempting to leave brain:', projectId, 'User ID:', user.id);
      
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      toast.success('You have left the brain');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving brain:', error);
      toast.error('Failed to leave brain');
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

        {isMember && !isOwner && (
          <DropdownMenuItem 
            onClick={handleQuitBrain}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Brain
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectActionsMenu;
