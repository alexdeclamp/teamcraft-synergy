import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Star, Users, Calendar, Image } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import MemberInvite from '@/components/MemberInvite';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectHeaderProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    is_favorite?: boolean;
  };
  userRole: string | null;
  membersCount: number;
  imagesCount: number;
  daysSinceCreation: number;
  onAddMember: () => void;
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  onInviteSuccess?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  userRole,
  membersCount,
  imagesCount,
  daysSinceCreation,
  onAddMember,
  showInviteDialog,
  setShowInviteDialog,
  onInviteSuccess,
}) => {
  const [favorite, setFavorite] = useState(project.is_favorite || false);
  const isMobile = useIsMobile();
  
  const toggleFavorite = async () => {
    // This would be implemented with a database update
    setFavorite(!favorite);
  };

  return (
    <div className="pb-4 sm:pb-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1 max-w-[70%]">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{project.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${favorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
              onClick={toggleFavorite}
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              <span className="sr-only">{favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
            </Button>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>{membersCount} Member{membersCount !== 1 ? 's' : ''}</span>
        </div>
        {!isMobile && <Separator orientation="vertical" className="h-4" />}
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>{imagesCount} Image{imagesCount !== 1 ? 's' : ''}</span>
        </div>
        {!isMobile && <Separator orientation="vertical" className="h-4" />}
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>
      
      {/* Member Invite Dialog */}
      {showInviteDialog && (
        <MemberInvite
          projectId={project.id}
          isOpen={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          onInviteSuccess={() => {
            if (onInviteSuccess) onInviteSuccess();
          }}
        />
      )}
    </div>
  );
};

export default ProjectHeader;
