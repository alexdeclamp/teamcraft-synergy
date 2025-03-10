
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import MemberActionsMenu from './MemberActionsMenu';
import { ProjectMember } from '@/types/project';

interface MemberItemProps {
  member: ProjectMember;
  userRole: string | null;
  onUpdateRole: (memberId: string, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

const MemberItem: React.FC<MemberItemProps> = ({
  member,
  userRole,
  onUpdateRole,
  onRemoveMember
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent/40">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
          <AvatarFallback>
            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
      </div>
      
      {userRole === 'owner' && member.role !== 'owner' && (
        <MemberActionsMenu 
          memberId={member.id}
          onUpdateRole={onUpdateRole}
          onRemoveMember={onRemoveMember}
        />
      )}
    </div>
  );
};

export default MemberItem;
