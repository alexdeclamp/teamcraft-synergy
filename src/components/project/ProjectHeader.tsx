
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Star, Users, Calendar, Image } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import MemberInvite from '@/components/MemberInvite';

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
  
  const toggleFavorite = async () => {
    // This would be implemented with a database update
    setFavorite(!favorite);
  };

  const canInvite = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="pb-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${favorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
              onClick={toggleFavorite}
            >
              <Star className="h-5 w-5 fill-current" />
              <span className="sr-only">{favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
            </Button>
          </div>
          <p className="text-muted-foreground">{project.description || "No description provided"}</p>
        </div>
        
        {canInvite && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-4 pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{membersCount} Member{membersCount !== 1 ? 's' : ''}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center text-sm text-muted-foreground">
          <Image className="h-4 w-4 mr-1" />
          <span>{imagesCount} Image{imagesCount !== 1 ? 's' : ''}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
        </div>
        {daysSinceCreation < 7 && (
          <Badge variant="outline" className="text-xs">New</Badge>
        )}
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
