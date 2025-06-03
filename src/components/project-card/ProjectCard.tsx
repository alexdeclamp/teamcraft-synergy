
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ExternalLink, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import ProjectCardActions from './ProjectCardActions';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  memberCount: number;
  isOwner?: boolean;
  role?: string;
  tags?: string[];
  className?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  onArchiveStatusChange?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  memberCount,
  isOwner,
  role,
  className,
  isFavorite = false,
  isArchived = false,
  onArchiveStatusChange,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const newFavoriteStatus = !favorite;
      
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setFavorite(newFavoriteStatus);
      const { toast } = await import('sonner');
      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 bg-white border hover:shadow-lg hover:-translate-y-1 animate-scale-in",
      isArchived && "opacity-60",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={toggleFavorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                )}
              />
            </Button>
            
            <ProjectCardActions 
              id={id} 
              isOwner={isOwner} 
              isFavorite={favorite}
              setFavorite={setFavorite}
              isArchived={isArchived}
              onArchiveStatusChange={onArchiveStatusChange}
              userRole={role}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
          
          <Link to={`/project/${id}`} className="flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors"
            >
              <span>Open</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
