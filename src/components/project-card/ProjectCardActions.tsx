
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, UserPlus, Archive, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProjectCardActionsProps {
  id: string;
  isOwner?: boolean;
  isFavorite: boolean;
  setFavorite: (state: boolean) => void;
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  id,
  isOwner,
  isFavorite,
  setFavorite
}) => {
  const navigate = useNavigate();

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

  const handleArchiveBrain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This would be implemented in a future update
    toast.info("Archive functionality coming soon");
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
          <DropdownMenuItem onClick={handleEditBrain}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit brain
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageMembers}>
            <UserPlus className="h-4 w-4 mr-2" />
            Manage members
          </DropdownMenuItem>
          {isOwner && (
            <DropdownMenuItem onClick={handleArchiveBrain}>
              <Archive className="h-4 w-4 mr-2" />
              Archive brain
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectCardActions;
